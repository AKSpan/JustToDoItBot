/**
 * Created by Span on 21.12.2015.
 */
var en_US = {
    change_lang:'Language changed to english!',
    choose_lang:"Select a language:",
    help: "With this bot you can create your own TODO list and keep track of your tasks.\n" +
    "1⃣ Use /list to get your task list.\n" +
    "2⃣ To add new task, use /add. \n" +
    "3⃣ To complete task, use /doit.\n" +
    "4⃣ To show expired tasks, use /expired.\n" +
    "5⃣ If you want get task(s) by ID or certain date, use /task.",
    print_task_text: "============{0}============\n" +
    "Text: {1}\n" +
    "Do date: {2}\n" +
    "Is done: {3}\n" +
    "Done date: {4}\n" +
    "Created date: {5}\n",
    list: {
        no_tasks_text: 'You do not have tasks. Use /add to *add* new task.'
    },
    add: {
        task_text: 'Write and send *task text* or /cancel to *abort operation*:',
        task_date: 'Write *date of completion* or /cancel to *abort operation*:',
        added: '⭐Task is added⭐'
    },
    cancel: 'Operation canceled.',
    doit: {
        id_text: 'Write task *ID* to complete it, or /cancel to *abort operation*:',
        complete: '⭐Task *#{0}* is complete⭐',
        incorrect_num: 'Incorrect number. Please, try again, or /cancel to *abort operation*:',
        upd_err: 'Task *#{0}* isn\'t updated.'
    },
    task: {
        task_text: 'Send /id or /date to find task(s) or /cancel to *abort operation*:',
        task_type: {
            id: 'Send task *ID* or /cancel to *abort operation*:',
            date: 'Send *date* in format dd.mm.yyyy or /cancel to *abort operation*:',
            invalid: 'Invalid parameter. Use /id, /date or /cancel.'
        },
        task_param: {
            not_found: 'Nothing found.'
        }
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
    }
};
module.exports.en_US = en_US;
var ru_RU = {
    change_lang:'Язык изменен на русский!',
    choose_lang:"Выберите язык:",
    help: "С помощью этого бота, Вы можете создать личный список задач и отслеживать их выполнение.\n" +
    "1⃣ Используйте команду /list чтобы получить список текущих задач.\n" +
    "2⃣ Для добавления новой задачи используйте команду /add.\n" +
    "3⃣ Чтобы выполнить задачу, используйте /doit.\n" +
    "4⃣ Команда /expired выведет невыполненные просроченные задачи.\n" +
    "5⃣ Если хотите просмотреть задачу(и) по её ID или по определенной дате, используйте /task.\n"+
    "6⃣ Для смены языка используйте команду /language.",
    print_task_text: "============{0}============\n" +
    "Текст: {1}\n" +
    "Выполнить к: {2}\n" +
    "Выполнена: {3}\n" +
    "Сделана: {4}\n" +
    "Создана: {5}\n",
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
    task: {
        task_text: 'Отправьте команду /id или /date, чтобы найти задачу(и) или команду /cancel для *отмены операции*:',
        task_type: {
            id: 'Отправьте *ID* задачи или команду /cancel для *отмены операции*:',
            date: 'Отправьте *Дату выполнения* в формате дд.мм.гггг (ЧЧ24:ММ:сс) или команду /cancel для *отмены операции*:',
            invalid: 'Неверный параметр. Используйте команды /id, /date или /cancel.'
        },
        task_param: {
            not_found: 'Ничего не найдено.'
        }
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
    }
};
module.exports.ru_RU = ru_RU;
