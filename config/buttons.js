const back = '🔙 Назад'
const cancel = '❌ Відмінити'
const about = '🤖 Про мене'

module.exports = {
  greeter: {
    mentor: '👨‍🏫 Я ментор',
    student: '👶 Шукаю ментора',
  },
  home: {
    student: {
      searchMentors: '🔍 Знайти менторів',
      becomeMentor: '🚀 Стати ментором',
      about,
    },
    mentor: {
      addDirection: '📚 Додати напрям',
      myDirections: '📜 Мої напрями',
      mentors: '🔍 Інші ментори',
      about,
    },
    admin: {

    },
  },
  back,
  cancel,
  about,
  inline: {
    pause7days: '🚫 на тиждень',
    pause31days: '🚫 на місяць',
    continue: '▶️ Продовжити',
    remove: '🗑️ Видалити',
    approve: '👍 Approve',
    reject: '👎 Reject',
  },
}
