const { existsSync, writeJsonSync, readJSONSync } = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = async function (databaseType, bankModel, fakeGraphql) {
    const pathBankData = path.join(__dirname, "..", "data/bankData.json");
    let Bank = [];

    if (databaseType === "json") {
        if (!existsSync(pathBankData)) writeJsonSync(pathBankData, [], { spaces: 2 });
        Bank = readJSONSync(pathBankData);
    } else if (databaseType === "mongodb" && bankModel) {
        Bank = await bankModel.find({}) || [];
    } else if (databaseType === "sqlite" && bankModel) {
        const result = await bankModel.findAll();
        Bank = result.map(i => i.get({ plain: true }));
    }

    global.db.allBankData = Bank;

    const defaultBankData = (userID) => ({
        userID,
        balance: 0,
        savings: 0,
        vault: 0,
        loan: 0,
        loanDate: null,
        creditScore: 600,
        bankLevel: 1,
        premium: false,
        multiplier: 1,
        streak: 0,
        reputation: 0,
        lastInterest: Date.now(),
        transactions: [],
        achievements: [],
        stocks: {},
        crypto: {},
        realEstate: [],
        businesses: [],
        vehicles: [],
        skills: { gambling: 0, trading: 0, business: 0, investing: 0 }
    });

    return {
        get: async function (userID, query = "{}") {
            let data = global.db.allBankData.find(i => i.userID == userID);
            if (!data) {
                data = await this.create(userID);
            }
            return typeof query === "string" && query !== "{}" ? fakeGraphql(query, data) : data;
        },

        getAll: async function (query = "{}") {
            if (query === "{}") return global.db.allBankData;
            return global.db.allBankData.map(item => fakeGraphql(query, item));
        },

        create: async function (userID) {
            const exist = global.db.allBankData.find(i => i.userID == userID);
            if (exist) return exist;

            const newData = defaultBankData(userID);

            if (databaseType === "json") {
                global.db.allBankData.push(newData);
                writeJsonSync(pathBankData, global.db.allBankData, { spaces: 2 });
            } else if (databaseType === "mongodb" && bankModel) {
                const created = new bankModel(newData);
                await created.save();
                global.db.allBankData.push(created.toObject());
            } else if (databaseType === "sqlite" && bankModel) {
                const created = await bankModel.create(newData);
                global.db.allBankData.push(created.get({ plain: true }));
            }

            return newData;
        },

        set: async function (userID, data) {
            let index = global.db.allBankData.findIndex(i => i.userID == userID);
            if (index === -1) {
                await this.create(userID);
                index = global.db.allBankData.findIndex(i => i.userID == userID);
            }

            global.db.allBankData[index] = { ...global.db.allBankData[index], ...data };
            const updatedData = global.db.allBankData[index];

            if (databaseType === "json") {
                writeJsonSync(pathBankData, global.db.allBankData, { spaces: 2 });
            } else if (databaseType === "mongodb" && bankModel) {
                await bankModel.updateOne({ userID }, { $set: data });
            } else if (databaseType === "sqlite" && bankModel) {
                await bankModel.update(data, { where: { userID } });
            }

            return updatedData;
        },

        delete: async function (userID) {
            global.db.allBankData = global.db.allBankData.filter(i => i.userID != userID);

            if (databaseType === "json") {
                writeJsonSync(pathBankData, global.db.allBankData, { spaces: 2 });
            } else if (databaseType === "mongodb" && bankModel) {
                await bankModel.deleteOne({ userID });
            } else if (databaseType === "sqlite" && bankModel) {
                await bankModel.destroy({ where: { userID } });
            }

            return true;
        },

        refresh: async function () {
            if (databaseType === "json") {
                if (existsSync(pathBankData)) global.db.allBankData = readJSONSync(pathBankData);
            } else if (databaseType === "mongodb" && bankModel) {
                global.db.allBankData = await bankModel.find({}) || [];
            } else if (databaseType === "sqlite" && bankModel) {
                const result = await bankModel.findAll();
                global.db.allBankData = result.map(i => i.get({ plain: true }));
            }
            return global.db.allBankData;
        }
    };
};
