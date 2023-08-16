import express from 'express';
import pkg from '@json-spec/core';
import { createAccountSpec } from './features/specs/account/create.js';
import { AccountManager } from './features/Account.js';
import { signinSpec } from './features/specs/account/signin.js';
const { isValid } = pkg;
const AccountMgr = new AccountManager();

export const server = () => {
    const app = express();
    app.post('/api/account', express.json(), async (req, res) => {
        if (!isValid(createAccountSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.AddNewAccount(req.body.id, req.body.name, req.body.privilege)
            .then(result => res.status(201).send(JSON.stringify(result)))
            .catch(er => {
                console.log(er.message);
            });
    });
    app.post('/api/signin', express.json(), async (req, res) => {
        if (!isValid(signinSpec, req.body)) return res.sendStatus(400);
        await AccountMgr.SignIn(req.body.id, req.body.password)
            .then(() => {
                res.sendStatus(200);
            })
            .catch(() => {
                res.sendStatus(401);
            });
    });
};
