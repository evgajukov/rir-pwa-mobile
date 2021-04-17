<template>
  <v-container fluid>
    <v-text-field v-model="surname" label="Фамилия" required />
    <v-text-field v-model="name" label="Имя" required />
    <v-text-field v-model="midname" label="Отчество" required />
    <v-text-field
      v-model="department.number"
      label="Введите номер квартиры"
      :hint="department.hint"
      :error-messages="department.errors" 
      persistent-hint
      required
      :disabled="btnDisabled()" />
    <v-text-field prefix="@" v-model="telegram" label="Аккаунт в телеграм" />
    <span class="text-subtitle-1">Настройки приватности</span><br />
    <span class="text-subtitle-2">Отображение имени</span>
    <v-radio-group v-model="access.name">
      <v-radio label="Не показывать имя" value="nothing" />
      <v-radio label="Показывать только имя" value="name" />
      <v-radio label="Показывать полностью" value="all" />
    </v-radio-group>
    <span class="text-subtitle-2">Отображение контактов</span>
    <v-checkbox v-model="access.mobile" label="Показывать телефон" hide-details />
    <v-checkbox v-model="access.telegram" label="Показывать аккаунт телеграм (если указан)" hide-details />
    <br /><br />
    <v-btn x-large color="success" dark @click="save">Сохранить</v-btn>
    <br /><br /><br /><br />
    <Toast v-if="toast.show" :show="toast.show" :text="toast.text" :color="toast.color" @close="toast.show = !toast.show" />
  </v-container>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Toast from "@/components/ToastComponent";

export default {
  name: "SettingsPage",
  data() {
    return {
      surname: null,
      name: null,
      midname: null,
      telegram: null,
      access: {
        name: "nothing",
        mobile: false,
        telegram: false,
      },
      department: {
        id: null,
        number: null,
        hint: null,
        errors: [],
      },
      toast: {
        show: false,
        text: null,
        color: null
      },
    };
  },
  computed: {
    ...mapState(["client", "user", "departments", "ready"]),
  },
  created() {
    this.setTitle("Настройки");
    this.init();
  },
  methods: {
    init() {
      if (this.user == null) return;
      if (this.user.person != null) {
       this.surname = this.user.person.surname;
       this.name = this.user.person.name;
       this.midname = this.user.person.midname;
       this.telegram = this.user.person.telegram;
       
       const access = this.user.person.access;
       this.access = {
         name: access.name.level == "nothing" ? "nothing" : access.name.format,
         mobile: access.mobile.level == "all",
         telegram: access.telegram.level == "all",
       };

      }
      if (this.ready.departments) {
        if (this.user.resident != null) {
          const department = this.user.resident.department;
          this.department = { id: department.id, number: department.number, hint: this.getHint(department) };
        }
      }
    },
    async save() {
      console.log("Сохранение профиля");
      if (this.department.id == null) {
        console.error("Необходимо указать номер кватиры");
        return;
      }

      const params = {
        surname: this.surname,
        name: this.name,
        midname: this.midname,
        telegram: this.telegram,
        department: this.department.id,
        access: {
          name: {
            level: this.access.name == "nothing" ? "nothing" : "all",
            format: this.access.name == "all" ? "all" : "name",
          },
          mobile: { level: this.access.mobile ? "all" : "friends" },
          telegram: { level: this.access.telegram ? "all" : "friends" },
        },
      };
      const result = await this.client.wrapEmit("user.saveProfile", params);
      console.log(result);
      if (result.status == "OK") {
        this.toast.text = "Успешно сохранили";
        this.toast.color = "success";
        this.toast.show = true;
        console.log(this.toast.text);
        
        this.setPerson(result.person);
        this.setResident(result.resident);
      } else {
        this.toast.text = "Сохранить не удалось. Попробуйте позже";
        this.toast.color = "error";
        this.toast.show = true;
        console.error(this.toast.text);
      }
    },
    getDepartment(number) {
      for (let department of this.departments) {
        if (department.number == number) return department;
      }
      return null;
    },
    getHint(department) {
      return `кв. №${department.number}, этаж ${department.floor}, подъезд ${department.section}`;
    },
    btnDisabled() {
      const result = !this.ready.departments;
      return result;
    },
    ...mapMutations(["setTitle", "setPerson", "setResident"]),
  },
  watch: {
    user() {
      this.init();
    },
    "ready.departments"() {
      if (this.user.resident != null) {
        const department = this.user.resident.department;
        this.department = { id: department.id, number: department.number, hint: this.getHint(department) };
      }
    },
    "department.number"() {
      if (this.department.number == null || this.department.number.length == 0) {
        this.department.id = null;
        this.department.hint = null;
        this.department.errors = ["Необходимо указать номер квартиры"];
        return;
      }
      const department = this.getDepartment(parseInt(this.department.number));
      if (department != null) {
        this.department.id = department.id;
        this.department.hint = this.getHint(department);
        this.department.errors = [];
      } else {
        this.department.id = null;
        this.department.hint = null;
        this.department.errors = ["Указанный номер квартиры не найден в доме"];
      }
    },
  },
  components: {
    Toast,
  },
};
</script>