import {Application} from 'express';

export const startServer = (app: Application, port: number | string) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}
            `)
    })
}