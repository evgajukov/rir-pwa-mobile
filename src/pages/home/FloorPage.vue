<template>
  <v-container fluid>
    <HomeStat :stat="stat" />
    <v-row dense>
      <v-col v-for="department in getDepartments({ section: sectionId, floor: floorId })" :key="department.number" cols="12">
        <v-card :to="{ name: 'department', params: { departmentNumber: department.number } }">
          <v-card-title class="blue-grey--text" :class="emptyDepartmentStyle(department)">Квартира №{{ department.number }}</v-card-title>
          <v-card-subtitle class="blue-grey--text" :class="emptyDepartmentStyle(department)">
            Жильцов: {{ department.residents.length }}<br />
            <span v-if="department.rooms != null">Комнат: {{ department.rooms }}<br /></span>
            <span v-if="department.square != null">Размер: {{ department.square }} кв.м.</span>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <br /><br />
    <Toast v-if="toast.show" :show="toast.show" :text="toast.text" color="warning" @close="toastClose" />
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import Toast from "@/components/ToastComponent";
import HomeStat from "./components/HomeStatComponent";

export default {
  name: "FloorPage",
  data() {
    return {
      stat: null,
      toast: {
        show: false,
        text: "Метод в разработке",
      }
    };
  },
  computed: {
    sectionId() {
      return this.$route.params.sectionId;
    },
    floorId() {
      return this.$route.params.floorId;
    },
    ...mapState(["ready"]),
    ...mapGetters(["getDepartments", "getDepartmentsStat"]),
  },
  created() {
    this.setTitle(`Подъезд ${this.sectionId} этаж ${this.floorId}`);
    if (this.ready.departments) this.stat = this.getDepartmentsStat().sections[this.sectionId].floors[this.floorId];
  },
  methods: {
    chat() {
      console.log("chat");
      this.toast.show = true;
    },
    vote() {
      console.log("vote");
      this.toast.show = true;
    },
    toastClose() {
      this.toast.show = false;
    },
    emptyDepartment(department) {
      return department.residents.length == 0;
    },
    emptyDepartmentStyle(department) {
      if (this.emptyDepartment(department)) return { "text--lighten-3": true };
      else return { "text--darken-4": true };
    },
    ...mapMutations(["setTitle"]),
  },
  watch: {
    "ready.departments"() {
      this.stat = this.getDepartmentsStat().sections[this.sectionId].floors[this.floorId];
    },
  },
  components: {
    Toast, HomeStat
  },
}
</script>