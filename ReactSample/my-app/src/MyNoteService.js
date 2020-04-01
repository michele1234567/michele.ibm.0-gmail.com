class MyNoteService {
    constructor() {

    }
    getNotes() {
        return [{ id: '1', noteText: 'aaaa' }, { id: '2', noteText: 'bbbb' }];
    }
};

export default new MyNoteService();