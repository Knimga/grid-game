const urls = {
    root: process.env.PUBLIC_URL,
    localRoot: 'http://localhost:4000/',
    post: (payload: any) => {
        return {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    },
    characters: {
        getAll: 'characters/getAll',
        create: 'characters/create',
        save: 'characters/save',
        delete: (_id: string) => `characters/delete/${_id}`,
        getBoardChars: 'characters/getBoardChars'
    },
    parties: {
        getAll: 'parties/getAll',
        partiesTabData: 'parties/partiesTabData',
        partyCharsById: (_id: string) => `parties/partyCharsById/${_id}`,
        save: 'parties/save',
        delete: (_id: string) => `parties/delete/${_id}`
    },
    dungeons: {
        getAll: 'dungeons/getAll',
        save: 'dungeons/save'
    },
    boards: {
        getSelections: 'boards/boardSelections',
        getGameBoardById: (_id: string) => `boards/getGameBoard/${_id}`,
        getAllBoards: 'boards/getAllBoards',
        save: 'boards/save'
    },
    gameData: {
        bulk: 'gameData/bulk'
    },
    classes: {
        getAll: 'classes/getAll',
        save: 'classes/save',
        create: 'classes/create'
    },
    actions: {
        getAll: 'actions/getAll',
        save: 'actions/save',
        create: 'actions/create'
    },
    armors: {
        getAll: 'armors/getAll',
        save: 'armors/save',
        create: 'armors/create'
    }
}

export default urls;