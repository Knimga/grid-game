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
        save: 'dungeons/save',
        dungeonSelections: 'dungeons/dungeonSelections',
        getGameDungeonById: (_id: string) => `dungeons/getGameDungeonById/${_id}`
    },
    gameData: {
        bulk: 'gameData/bulk'
    },
    classes: {
        getAll: 'classes/getAll',
        save: 'classes/save',
        getTalentsByClassId: (_id: string) => `classes/getTalentsByClassId/${_id}`
    },
    actions: {
        getAll: 'actions/getAll',
        save: 'actions/save'
    },
    armors: {
        getAll: 'armors/getAll',
        save: 'armors/save'
    },
    weapons: {
        getAll: 'weapons/getAll',
        save: 'weapons/save'
    },
    passives: {
        getAll: 'passives/getAll',
        save: 'passives/save'
    }
}

export default urls;