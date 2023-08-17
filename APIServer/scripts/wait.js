import { PrismaClient } from '@prisma/client';
const Client = new PrismaClient();

const WaitProcess = async () => {
    return await Client.$queryRaw`SELECT 1`
        .then(() => {
            console.log('MySQL is running');
            return Promise.resolve();
        })
        .catch(() => WaitProcess());
};

WaitProcess();
