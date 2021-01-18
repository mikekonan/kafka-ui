<template>
  <div class="messages-container">
    <div style="max-height: 100%; overflow: auto">
      <div style="height: 1500px">
        <Message :message="this.message"></Message>
      </div>
    </div>
  </div>
</template>

<script>
import Message from "@/components/Message.vue";

export default {
  components: { Message },
  data() {
    return {
      message: {
        headers: {},
        payload: {
          data: {
            requester: {
              id: "95d20576-7551-41f9-9a0d-7a7e7add1aee"
            },
            users: [
              {
                active: true,
                fullName: " с",
                id: "cf706b4c-e49c-4389-9c94-a2bc1467d6a4",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "none",
                username: "rita123456789@gmail.com"
              },
              {
                active: true,
                fullName: "    ",
                id: "d9faf01e-dd15-4f21-ad79-bdb050604bf0",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "none",
                username: "123test@softswiss.com"
              },
              {
                active: true,
                fullName: "alert",
                id: "c302360f-c0c5-4649-99f1-4d49e22c6abc",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "none",
                username: "sdfdsfsd@gmail.com"
              },
              {
                active: true,
                fullName: "Gleb",
                id: "fa8e0f8e-68b7-4c6b-97ce-c4e3b2197e9b",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "none",
                username: "gleb.beloded@softswiss.com"
              },
              {
                active: true,
                fullName: "antonio.banderas@softswiss.com",
                id: "b23d2888-dfb3-fa58-a376-2a96dabde376",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "totp",
                username: "antonio.banderas@softswiss.com"
              },
              {
                active: true,
                fullName: "Avtomat Koli",
                id: "3b9f6bce-d57d-44f5-a7df-f2c458efd8be",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "totp",
                username: "avtomat_koli@softswiss.com"
              },
              {
                active: true,
                fullName: "Mikita Revaka",
                id: "8e91b182-b6f7-421c-9d2e-3787635a5d3e",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "totp",
                username: "mikita.revaka@softswiss.com"
              },
              {
                active: true,
                fullName: "Marina Privalova",
                id: "d35cd4d5-29d2-4e61-994e-71b1ae64a3ad",
                metadata: {
                  country: "Белоруссия"
                },
                mfaType: "totp",
                username: "yabatska@softswiss.com"
              },
              {
                active: true,
                fullName: "Alexey Sergey",
                id: "2c854dfd-e5e6-43d4-b36b-9990f5cd887f",
                metadata: {
                  country: "Belarus1"
                },
                mfaType: "totp",
                username: "alexey.sergey@softswiss.com"
              },
              {
                active: true,
                fullName: "123456789012345678901234567890",
                id: "32c3c800-b9d4-4353-a19d-c0c27d2331fd",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "none",
                username:
                  "testtesttsdasdfsdfsdfsdsdsgfdesttestvtesttesttesttesttest@softswiss.com"
              },
              {
                active: true,
                fullName: "Test Create",
                id: "0b79979b-ab5a-489e-8a12-b9a8d970dcf0",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "totp",
                username: "test123@softswiss.com"
              },
              {
                active: true,
                fullName: "Dellink",
                id: "b1331721-0d39-424e-90ed-4eb0a5c71b97",
                metadata: {
                  country: "Asa"
                },
                mfaType: "none",
                username: "dellink@ya.ru"
              },
              {
                active: true,
                fullName: "Vadim Drozd",
                id: "1b3e2f12-7707-46fb-98c4-26eaa2c1cfd9",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "totp",
                username: "vadim.drozd@softswiss.com"
              },
              {
                active: true,
                fullName: "ikarus.tsoya",
                id: "efecbbdc-000f-471c-8abd-9bc39c704cdf",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "none",
                username: "ikarus.tsoya@softswiss.com"
              },
              {
                active: true,
                fullName: "Rita",
                id: "95d20576-7551-41f9-9a0d-7a7e7add1aee",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "totp",
                username: "rita.rimkevich@softswiss.com"
              },
              {
                active: true,
                fullName: "Sergey Adamovich",
                id: "6da46119-5add-4344-9c8b-99a2aa1d739e",
                metadata: {
                  country: "Belarus"
                },
                mfaType: "totp",
                username: "s_detstva_za_agl@softswiss.com"
              },
              {
                active: true,
                fullName: "Sergey Kunitskiy",
                id: "518dea60-1179-419f-9417-35a3dafb1ea8",
                metadata: {
                  country: " Lithuania"
                },
                mfaType: "totp",
                username: "sergey.kunitskiy@softswiss.com"
              },
              {
                active: true,
                fullName: "проверка3",
                id: "4e2d9796-a135-4bb2-8a5f-92a64da5664a",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "totp",
                username: "test3@softswiss.com"
              },
              {
                active: true,
                fullName: "sss",
                id: "72adaf3d-af95-44e2-87d1-9db55e6f59de",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "none",
                username: "qwerty@softswiss.com"
              },
              {
                active: true,
                fullName: "New user",
                id: "119f18e7-874b-4e37-b8bd-a928afa4694c",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "totp",
                username: "qwerty7@softswiss.com"
              },
              {
                active: true,
                fullName: "Olga Berezovskaya",
                id: "cfc25bac-b465-4944-be62-46ce30d82847",
                metadata: {
                  country: "Lithuania"
                },
                mfaType: "totp",
                username: "olga.berezovskaya@softswiss.com"
              }
            ]
          },
          tracing: {
            SpanID: "e96f6391f30f63fa",
            TraceFlags: 1,
            TraceID: "ad9bfe2e57a930196ad16242053221d2"
          }
        }
      }
    };
  }
};
</script>

<style scoped>
.messages-container {
  padding: 10px;
  position: relative;
  height: calc(100% - 140px);
  background-color: rgb(30, 30, 30);
  border-radius: 8px;
}
</style>
