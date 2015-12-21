/**
 * Created by Span on 21.12.2015.
 */
var en_US = {

    help: "With this bot you can create your own TODO list and keep track of your tasks.\n" +
    "1? Use /list to get your task list.\n" +
    "2? To add new task, use /add. \n" +
    "3? To complete task, use /doit.\n" +
    "4? To show expired tasks, use /expired.\n" +
    "5? If you want get task(s) by ID or certain date, use /task.",
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
        added: '?Task is added?'
    },
    cancel: 'Operation canceled.',
    doit: {
        id_text: 'Write task *ID* to complete it, or /cancel to *abort operation*.',
        complete: '?Task *#{0}* is complete?',
        incorrect_num: 'Incorrect number. Please, try again, or /cancel to *abort operation*.',
        upd_err: 'Task *#{0}* isn\'t updated.'
    },
    task: {
        task_text: 'Send /id or /date to find task(s) or /cancel to *abort operation*.',
        task_type: {
            id: 'Send task *ID* or /cancel to *abort operation*.',
            date: 'Send *date* in format dd.mm.yyyy or /cancel to *abort operation*.',
            invalid: 'Invalid parameter. Use /id, /date or /cancel.'
        },
        task_param: {
            not_found: 'Nothing found.'
        }
    },
    del: {
        id_text: 'Send task *ID* or /cancel to *abort operation*.',
        task_delete: {
            incorrect: 'Incorrect number. Please, try again, or /cancel to *abort operation*.',
            removed: '?Task with *#{0}* was successfully removed?',
            not_removed: 'vTask was not removed :('
        }
    },
    expired: {
        not_found: 'Nothing found.',
        no_expired: 'You do not have expired tasks.'
    },

};
module.exports.en_US = en_US;
var ru_RU = {
    success: {},
    error: {}
};
