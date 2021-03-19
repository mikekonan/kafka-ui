package ws

//go:generate go-enum -f=$GOFILE --marshal
//ENUM(
//topics
//messages
//)
type WsCommandType uint

//ENUM(
//eq
//ne
//gt
//ge
//lt
//le
//)
type OperatorType uint

//ENUM(
//int
//str
//)
type CastType uint

type Filter struct {
	Param    string       `json:"parameter"`
	Operator OperatorType `json:"operator"`
	Value    string       `json:"value"`
}

type MessageRequest struct {
	Command WsCommandType `json:"request"`
	Filters []Filter      `json:"filters,omitempty"`
}

type Message struct {
	Topic       string                 `json:"topic"`
	Headers     map[string]string      `json:"headers"`
	Offset      string                 `json:"offset"`
	Partition   string                 `json:"partition"`
	Timestamp   string                 `json:"timestamp"`
	At          string                 `json:"at"`
	PayloadSize string                 `json:"payloadSize"`
	Payload     map[string]interface{} `json:"payload"`
}

type Topic struct {
	Topic Message `json:"topic"`
}

type Messages struct {
	Message Message `json:"message"`
}
