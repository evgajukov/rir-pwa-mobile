<template>
  <v-container fluid>
    <v-card v-if="department != null" color="#1F7087" dark class="mb-2">
      <v-card-title>Квартира №{{ department.number }}</v-card-title>
      <v-card-subtitle>
        Жильцов: {{ department.residents.length }}<br />
        <span v-if="department.rooms != null">Комнат: {{ department.rooms }}<br /></span>
        <span v-if="department.square != null">Размер: {{ department.square }} кв.м.</span>
      </v-card-subtitle>
    </v-card>
    <v-row v-if="department != null && department.residents.length != 0" dense>
      <v-col v-for="resident of department.residents" :key="resident.id" cols="12">
        <v-card>
          <v-card-title>{{ resident | fio }}</v-card-title>
          <v-card-subtitle v-if="resident.mobile != null || resident.telegram != null">
            <v-icon v-if="resident.mobile != null" small>mdi-cellphone-android</v-icon> {{ resident.mobile | formatMobile }}<br />
            <v-icon v-if="resident.telegram != null" small>mdi-telegram</v-icon> <a :href="`https://t.me/${resident.telegram}`">{{ resident.telegram }}</a>
          </v-card-subtitle>
          <v-card-actions v-if="!resident.deleted">
            <v-spacer></v-spacer>
            <v-btn icon @click="sendMessage(resident)">
              <v-icon>mdi-chat-outline</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";

export default {
  name: "DepartmentPage",
  data() {
    return {
      department: null,
    };
  },
  computed: {
    departmentNumber() {
      return this.$route.params.departmentNumber;
    },
    ...mapState(["ready", "client"]),
    ...mapGetters(["getDepartment"]),
  },
  async created() {
    this.setTitle(`кв. ${this.departmentNumber}`);
    if (this.ready.departments) await this.loadDepartmentInfo();
  },
  methods: {
    async loadDepartmentInfo() {
      this.department = this.getDepartment(this.departmentNumber);
      const residents = await this.client.wrapEmit("department.info", { departmentNumber: this.departmentNumber });
      if (residents != null) this.department.residents = residents;
    },
    async sendMessage(resident) {
      const result = await this.client.wrapEmit("im.createPrivateChannel", { personId: resident.personId });
      if (result.channelId != null) this.$router.push({ name: "imMessages", params: { channelId: result.channelId } });
    },
    ...mapMutations(["setTitle"]),
  },
  filters: {
    fio(profile) {
      const empty = value => value == null || value.trim().length == 0;
      if (profile == null) return "";
      if (profile.deleted) return "Удаленный аккаунт";
      const name = profile.name != null ? profile.name : "";
      const surname = profile.surname != null ? profile.surname : "";
      const midname = profile.midname != null ? profile.midname : "";
      const result = `${surname} ${name} ${midname}`;
      return empty(result) ? "Сосед не желает показывать имя" : result;
    },
    formatMobile(value) {
      if (value == null) return "";
      return `+${value}`;
    },
  },
  watch: {
    async "ready.departments"() {
      await this.loadDepartmentInfo();
    },
  },
};
</script>