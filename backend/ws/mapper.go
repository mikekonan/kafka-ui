package ws

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"backend/store"
)

var messageFilterFields = map[CastType]string{
	CastTypeInt: "topic;at",
	CastTypeStr: "offset;partition;timestamp;size",
	//"topic":     CastTypeStr,
	//"offset":    CastTypeInt,
	//"partition": CastTypeInt,
	//"timestamp": CastTypeInt,
	//"at":        CastTypeStr,
	//"size":      CastTypeInt,
}

func ConvertToWsMessage(message store.Message) Messages {
	var headers = map[string]string{}
	_ = json.Unmarshal(message.Headers, &headers)

	var body = map[string]interface{}{}
	_ = json.Unmarshal(message.Message, &body)

	return Messages{
		Message: Message{
			Topic:       message.Topic,
			Headers:     headers,
			Offset:      strconv.FormatInt(int64(message.Offset), 10),
			Partition:   string(rune(message.Partition)),
			Timestamp:   strconv.FormatInt(message.Timestamp, 10),
			At:          message.At.Format(time.RFC3339),
			PayloadSize: strconv.Itoa(message.Size),
			Payload:     body,
		},
	}
}

func ConvertToWsTopic(message store.Message) Topic {
	return Topic{
		Topic: Message{
			Topic: message.Topic,
		},
	}
}

func ConvertToStoreFilter(request MessageRequest) (result store.Filters) {
	if len(request.Filters) == 0 {
		return store.Filters{}
	}

	for _, filter := range request.Filters {
		if filter.Param == "topic" {
			result.Topic = filter.Value
		}

		result.Filters = append(result.Filters, store.Filter{
			FieldName:  filter.Param,
			FieldValue: filter.Value,
			Comparator: New(filter.Operator, getCastType(filter.Param)),
		})
	}
	return
}

func getCastType(fieldName string) CastType {
	for t, v := range messageFilterFields {
		if strings.Contains(v, strings.ToLower(fieldName)) {
			return t
		}
	}
	return CastTypeStr
}
