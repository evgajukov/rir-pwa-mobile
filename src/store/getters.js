export default {
  getSections: state => () => {
    if (state.departments == null) return [];
    let sections = {};
    state.departments.forEach(department => {
      if (sections[department.section] == null) sections[department.section] = { section: department.section, min: Number.MAX_VALUE, max: 0, floors: 0 };
      if (sections[department.section].min > department.number) sections[department.section].min = department.number;
      if (sections[department.section].max < department.number) sections[department.section].max = department.number;
      if (sections[department.section].floors < department.floor) sections[department.section].floors = department.floor;
    });
    return sections;
  },
  getFloors: state => (section) => {
    if (state.departments == null) return {};
    let departments = state.departments.filter(department => department.section == section);
    let floors = {};
    departments.forEach(department => {
      if (floors[department.floor] == null) floors[department.floor] = { floor: department.floor, min: Number.MAX_VALUE, max: 0 };
      if (floors[department.floor].min > department.number) floors[department.floor].min = department.number;
      if (floors[department.floor].max < department.number) floors[department.floor].max = department.number;
    });
    return floors;
  },
  getDepartments: state => ({ section, floor }) => {
    if (state.departments == null) return {};
    return state.departments.filter(department => department.section == section && department.floor == floor);
  },
  getDepartment: state => (departmentNumber) => {
    if (state.departments == null) return null;
    for (let department of state.departments) {
      if (department.number == departmentNumber) return department;
    }
    return null;
  },
  getDepartmentsStat: state => () => {
    let stat = { departments: 0, busy: 0, persons: 0, squares: 0, busySquares: 0, sections: {} };
    if (state.departments == null) return stat;
    
    for (let department of state.departments) {
      // общая статистика
      stat.departments++;
      if (department.residents.length != 0) {
        stat.busy++;
        stat.busySquares += department.square;
      }
      stat.persons += department.residents.length;
      stat.squares += department.square;
      
      // статистика по секциям
      if (stat.sections[department.section] == null) stat.sections[department.section] = { departments: 0, busy: 0, persons: 0, squares: 0, busySquares: 0, floors: {} };
      stat.sections[department.section].departments++;
      if (department.residents.length != 0) {
        stat.sections[department.section].busy++;
        stat.sections[department.section].busySquares += department.square;
      }
      stat.sections[department.section].persons += department.residents.length;
      stat.sections[department.section].squares += department.square;

      // статистика по этажам
      if (stat.sections[department.section].floors[department.floor] == null) stat.sections[department.section].floors[department.floor] = { departments: 0, busy: 0, persons: 0, squares: 0, busySquares: 0 };
      stat.sections[department.section].floors[department.floor].departments++;
      if (department.residents.length != 0) {
        stat.sections[department.section].floors[department.floor].busy++;
        stat.sections[department.section].floors[department.floor].busySquares += department.square;
      }
      stat.sections[department.section].floors[department.floor].persons += department.residents.length;
      stat.sections[department.section].floors[department.floor].squares += department.square;
    }

    return stat;
  },
  getInstructionsCount: state => () => {
    if (state.instructions == null) return 0;
    return state.instructions.length;
  },
  getDocumentsCount: state => () => {
    if (state.documents == null) return 0;
    return state.documents.length;
  },
  getFAQCount: state => (categoryId) => {
    if (state.faq == null) return 0;
    if (categoryId == null) return state.faq.length;
    return state.faq.filter(item => item.category.id == categoryId).length;
  },
  getFAQCategories: state => () => {
    if (state.faq == null) return [];
    let categories = {};
    for (let answer of state.faq) {
      categories[answer.category.id] = {
        id: answer.category.id,
        name: answer.category.name,
        description: answer.category.description
      };
    }
    return categories;
  },
  getFAQList: state => (categoryId) => {
    if (state.faq == null) return [];
    if (categoryId == null) return state.faq;
    return state.faq.filter(item => item.category.id == categoryId);
  },
  getRecommendation: state => (recommendationId) => {
    if (state.recommendations == null) return null;
    for (let recommendation of state.recommendations) {
      if (recommendation.id == recommendationId) return recommendation;
    }
    return null;
  },
  getRecommendationsCount: state => (categoryId) => {
    if (state.recommendations == null) return 0;
    if (categoryId == null) return state.recommendations.length;
    return state.recommendations.filter(item => item.category.id == categoryId).length;
  },
  getRecommendationCategories: state => () => {
    if (state.recommendations == null) return [];
    let categories = {};
    for (let recommendation of state.recommendations) {
      categories[recommendation.category.id] = {
        id: recommendation.category.id,
        name: recommendation.category.name,
        img: recommendation.category.img
      };
    }
    return categories;
  },
  getRecommendationList: state => (categoryId) => {
    if (state.recommendations == null) return [];
    if (categoryId == null) return state.recommendations;
    return state.recommendations.filter(item => item.category.id == categoryId);
  },
  getVotesCount: state => () => {
    if (state.votes == null) return 0;
    return state.votes.length;
  },
  getVote: state => (voteId) => {
    if (state.votes == null) return null;
    for (let i = 0; i < state.votes.length; i++) {
      if (state.votes[i].id == voteId) return state.votes[i];
    }
    return null;
  },
  getRndVote: state => () => {
    if (state.votes == null) return null;
    const votes = state.votes.filter(vote => {
      // уже закрытые нам не интересны
      if (vote.closed) return false;
      
      // также отфильтровываем те, на которые мы уже ответили
      if (vote.answers == null) return true; // еще никто не ответил
      const person = state.user.person;
      if (person == null) return false; // пока нет данных по нам
      return vote.answers.filter(answer => answer.person.id == person.id).length == 0;
    });
    if (votes.length == 0) return null;
    return votes[0]; // TODO: взять случайный из списка
  },
  getIMChannel: state => (channelId) => {
    if (state.imChannels == null) return null;
    for (let i = 0; i < state.imChannels.length; i++) {
      if (state.imChannels[i].id == channelId) return state.imChannels[i];
    }
    return null;
  },
};