/**
 * Created by Span on 21.12.2015.
 */
var en_US = {
    change_lang: 'Language changed to english!',
    choose_lang: "Select a language:",
    help: "With this bot you can create your own TODO list and keep track of your tasks.\n" +
    "\u0031\u20e3 Use /list to get your task list.\n" +
    "\u0032\u20e3 To add new task, use /add. \n" +
    "\u0033\u20e3 To complete task, use /doit.\n" +
    "\u0034\u20e3 To show expired tasks, use /expired.\n" +
    "\u0035\u20e3 If you want get task(s) by ID or certain date, use /search.\n" +
    "\u0036\u20e3 For select language, use /language",
    print_task_text: "============*{0}*============\n" +
    "*Text:* {1}\n" +
    "*Do date:* {2}\n" +
    "*Is done:* {3}\n" +
    "*Done date:* {4}\n" +
    "*Created date:* {5}\n",
    list: {
        no_tasks_text: 'You do not have tasks. Use /add to *add* new task.'
    },
    add: {
        task_text: 'Write and send *task text* or /cancel to *abort operation*:',
        task_date: 'Write *date of completion* or /cancel to *abort operation*:',
        added: '⭐Task is added⭐'},
    cancel: 'Operation canceled.',
    doit: {
        id_text: 'Write task *ID* to complete it, or /cancel to *abort operation*:',
        complete: '⭐Task *#{0}* is complete⭐',
        incorrect_num: 'Incorrect number. Please, try again, or /cancel to *abort operation*:',
        upd_err: 'Task *#{0}* isn\'t updated.'
    },
    search: {
        task_text: 'Send /id or /date to find task(s) or /cancel to *abort operation*:',
        search_type: {
            id: 'Send task *ID* or /cancel to *abort operation*:',
            date: 'Send *date* or *time* or /cancel to *abort operation*:',
            invalid: 'Invalid parameter. Use /id, /date or /cancel.'
        },
        task_param: {
            not_found: 'Nothing found.'
        },
        invalid_id:'Please write correct *ID*.'
    },
    del: {
        id_text: 'Send task *ID* or /cancel to *abort operation*:',
        task_delete: {
            incorrect: 'Incorrect number. Please, try again, or /cancel to *abort operation*:',
            removed: '⭐Task with *#{0}* was successfully removed⭐',
            not_removed: 'Task was not removed :('
        }
    },
    expired: {
        not_found: 'Nothing found.',
        no_expired: 'You do not have expired tasks.'
    },
    text_invalid: "Sorry, but text cannot begin like command (with '/'). Try again or /cancel to *abort operation*:",
    faq:"*1. How add task?*\n" +
    "Use /add command. Then you should write a task text. You can use any characters, except character '/'. Only *commands* can start with '/'.\n" +
    "After select the end date of the task. The task will be added if the text of the problem or the date indicated correctly.\n" +
    "*2. How I can show my tasks?*\n" +
    "Use command /list to show your tasks.\n" +
    "*3. How do I mark a task as completed?*\n" +
    "Send to bot command /doit and then select task ID which You completed. To avoid confusion, specify the ID as number.\n" +
    "*4. Where I can find search function and how does it work?*\n" +
    "Send bot a /more command to get /search and other commands. You can find task by ID and by date of completion.\n" +
    "If find by ID, You can specify either a single ID _(ex. 1 or 5)_ and multiple IDs _(ex. 2,5,7)_or IDs range _(ex. 1..3 or 4..10)_.\n" +
    "When searching by date of completion send date in format dd.mm.yyyy HH24:mm:ss."

};
module.exports.en_US = en_US;
var ru_RU = {
    change_lang: 'Язык изменен на русский!',
    choose_lang: "Выберите язык:",
    help: "С помощью этого бота, Вы можете создать личный список задач и отслеживать их выполнение.\n" +
    "\u0031\u20e3 Используйте команду /list чтобы получить список текущих задач.\n" +
    "\u0032\u20e3 Для добавления новой задачи используйте команду /add.\n" +
    "\u0033\u20e3 Чтобы выполнить задачу, используйте /doit.\n" +
    "\u0034\u20e3 Команда /expired выведет невыполненные просроченные задачи.\n" +
    "\u0035\u20e3 Если хотите просмотреть задачу(и) по её ID или по определенной дате, используйте /search.\n" +
    "\u0036\u20e3 Для смены языка используйте команду /language.",
    print_task_text: "============*{0}*============\n" +
    "*Текст:* {1}\n" +
    "*Выполнить к:* {2}\n" +
    "*Выполнена:* {3}\n" +
    "*Сделана:* {4}\n" +
    "*Создана:* {5}\n",
    list: {
        no_tasks_text: 'У Вас нет задач. Используйте /add для *добавления* новой задачи.'
    },
    add: {
        task_text: 'Введите *Текст задачи* или команду /cancel для *отмены операции*:',
        task_date: 'Введите *Дату выполнения* или команду /cancel для *отмены операции*:',
        added: '⭐Задача добавлена⭐'
    },
    cancel: 'Операция отменена.',
    doit: {
        id_text: 'Введите *ID* задачи, чтобы выполнить её, или команду /cancel для *отмены операции*:',
        complete: '⭐Задача с *#{0}* выполнена⭐',
        incorrect_num: 'Некорректный номер. Попробуйте заного или отправьте команду /cancel для *отмены операции*:',
        upd_err: 'Не удалось обновить задачу с *#{0}*.'
    },
    search: {
        task_text: 'Отправьте команду /id или /date, чтобы найти задачу(и) или команду /cancel для *отмены операции*:',
        search_type: {
            id: 'Отправьте *ID* задачи или команду /cancel для *отмены операции*:',
            date: 'Отправьте *дату* или *время* или команду /cancel для *отмены операции*:',
            invalid: 'Неверный параметр. Используйте команды /id, /date или /cancel.'
        },
        task_param: {
            not_found: 'Ничего не найдено.'
        },
        invalid_id:'Пожалуйста введите корректный *ID*.'
    },
    del: {
        id_text: 'Отправьте *ID* задачи или команду /cancel для *отмены операции*:',
        task_delete: {
            incorrect: 'Некорректный номер. Попробуйте заного или отправьте команду /cancel для *отмены операции*:',
            removed: '⭐Задача с *#{0}* успешно удалена⭐',
            not_removed: 'Не удалось удалить задачу :('
        }
    },
    expired: {
        not_found: 'Ничего не найдено.',
        no_expired: 'У Вас нет просроченных задач.'
    },
    text_invalid: "Извините, но текст не может начинаться как команда (со '/'). Введите заного или отправьте /cancel для *отмены операции*:"
};
module.exports.ru_RU = ru_RU;
