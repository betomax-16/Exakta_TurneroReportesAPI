import TraceHistory from '../models/traceHistory';
import { RequestExternalAPI } from "../utils/requestExternalAPI";
import moment from "moment";
import { diacriticSensitiveRegex } from "../models/utils/queryRequest";
import querystring  from "querystring";

class TraceHistoryController {
    static async generalReport(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const res = await TraceHistoryController.detailedReport(startDate, finalDate, sucursal, area);
        
            const resum: any[] = [];
            const resSuc = await RequestExternalAPI.request('GET', '/api/sucursal');
            
            for (let index = 0; index < resSuc.body.length; index++) {
                const suc = resSuc.body[index];
                const shiftsBySucursal = res.filter(r => r.sucursal === suc.name);

                if (shiftsBySucursal.length) {
                    const sucName = querystring.escape(suc.name);
                    const resSucArea = await RequestExternalAPI.request('GET', `/api/area-sucursal/${sucName}`);
                    if (resSucArea.body.length) {
                        const auxAreas = [...resSucArea.body];
                        for (let index2 = 0; index2 < resSucArea.body.length; index2++) {
                            const element = {...resSucArea.body[index2]};
                            if (element.area !== 'Resultados') {
                                element.area = `Toma ${element.area}`;
                            }

                            auxAreas.push(element);
                        }
    
                        
                        for (let index3 = 0; index3 < auxAreas.length; index3++) {
                            const element = auxAreas[index3];
                            const shiftsBySucursalAndArea = shiftsBySucursal.filter(r => r.area === element.area);
    
                            const maxWaitTime = Math.max.apply(Math, shiftsBySucursalAndArea.map((o) => { return o.wt; }));
                            const maxWaitAttentionTime = Math.max.apply(Math, shiftsBySucursalAndArea.map((o) => { return o.at; }));
    
                            const canceledShifts = shiftsBySucursalAndArea.filter(r => r.lastState === 'cancelado').length;

                            let shiftsFinished = 0;
                            if (element.area.includes('Toma')) {
                                shiftsFinished = shiftsBySucursalAndArea.filter(r => r.lastState === 'terminado').length;
                            }
                            else if (element.area === 'Resultados') {
                                shiftsFinished = shiftsBySucursalAndArea.filter(r => r.lastState === 'terminado').length;
                            }
                            else {
                                shiftsFinished = shiftsBySucursalAndArea.filter(r => r.lastState === 'espera toma').length;
                            }
                            
    
                            const sumWaitTime = shiftsBySucursalAndArea.reduce((accumulator, object) => {
                                return accumulator + object.wt;
                            }, 0);
    
                            const sumAttentionTime = shiftsBySucursalAndArea.reduce((accumulator, object) => {
                                return accumulator + object.at;
                            }, 0);
    
                            const sumServiceTime = shiftsBySucursalAndArea.reduce((accumulator, object) => {
                                return accumulator + object.st;
                            }, 0);
                            
                            const averageWaitTime = shiftsBySucursalAndArea.length === 0 ? 0 : sumWaitTime / shiftsBySucursalAndArea.length;
                            const averageAttentionTime = shiftsBySucursalAndArea.length === 0 ? 0 : sumAttentionTime / shiftsBySucursalAndArea.length;
                            const averageServiceTime = shiftsBySucursalAndArea.length === 0 ? 0 : sumServiceTime / shiftsBySucursalAndArea.length;

                            resum.push({
                                sucursal: suc.name,
                                area: element.area,
                                shiftsCreated: shiftsBySucursalAndArea.length,
                                canceledShifts: canceledShifts,
                                shiftsFinished: shiftsFinished,
                                averageWaitTime: TraceHistoryController.msToTime(averageWaitTime),
                                averageAttentionTime: TraceHistoryController.msToTime(averageAttentionTime),
                                averageServiceTime: TraceHistoryController.msToTime(averageServiceTime),
                                maxWaitTime: TraceHistoryController.msToTime(maxWaitTime),
                                maxWaitAttentionTime: TraceHistoryController.msToTime(maxWaitAttentionTime)
                            });
                        }
                    }
                }
            }

            return resum;
        }
        catch (error: any) {
            throw error;
        }
    }

    static async generalReportByHour(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const res = await TraceHistoryController.detailedReport(startDate, finalDate, sucursal, area);
        
            const resum: any[] = [];
            const resSuc = await RequestExternalAPI.request('GET', '/api/sucursal');
            
            for (let index = 0; index < resSuc.body.length; index++) {
                const suc = resSuc.body[index];
                const shiftsBySucursal = res.filter(r => r.sucursal === suc.name);

                if (shiftsBySucursal.length) {
                    const sucName = querystring.escape(suc.name);
                    const resSucArea = await RequestExternalAPI.request('GET', `/api/area-sucursal/${sucName}`);
                    if (resSucArea.body.length) {
                        const auxAreas = [...resSucArea.body];
                        for (let index2 = 0; index2 < resSucArea.body.length; index2++) {
                            const element = {...resSucArea.body[index2]};
                            if (element.area !== 'Resultados') {
                                element.area = `Toma ${element.area}`;
                            }

                            auxAreas.push(element);
                        }
    
                        
                        for (let index3 = 0; index3 < auxAreas.length; index3++) {
                            const element = auxAreas[index3];
                            const shiftsBySucursalAndArea = shiftsBySucursal.filter(r => r.area === element.area);
    //------------------------------------------------------------------------------------
                            const interval = 30;
                            const objectTracesTurnByInterval: any = {};
                            let dateInit = moment().hour(0).minute(0);
                            let dateFinish = moment().hour(0).minute(0);
                            for (let index = 0; index < 48; index++) {
                                const hour: string = dateInit.hour() < 10 ? `0${dateInit.hour()}` : dateInit.hour().toString();
                                const minute: string = dateInit.minute() < 10 ? `0${dateInit.minute()}` : dateInit.minute().toString();
                                const indexTime = `${hour}:${minute}`;
                                
                                dateFinish = dateFinish.add(interval, 'minute');
                                let result: any[] = [];
                                if (dateInit.hour() === dateFinish.hour()) {
                                    result = shiftsBySucursalAndArea.filter(r => 
                                        moment(r.startDate).hour() === dateInit.hour() && 
                                        moment(r.startDate).minute() >= dateInit.minute() && 
                                        moment(r.startDate).minute() < dateFinish.minute());
                                }
                                else {
                                    result = shiftsBySucursalAndArea.filter(r => 
                                        moment(r.startDate).hour() === dateInit.hour() && 
                                        moment(r.startDate).minute() >= dateInit.minute());
                                }
                                
                                if (result && result.length) {
                                    objectTracesTurnByInterval[indexTime] = result;
                                }
                                dateInit = dateInit.add(interval, 'minute');
                            }
                            



                            for (const key in objectTracesTurnByInterval) {
                                if (Object.prototype.hasOwnProperty.call(objectTracesTurnByInterval, key)) {
                                    let traces: any[] = objectTracesTurnByInterval[key];

                                    const maxWaitTime = Math.max.apply(Math, traces.map((o) => { return o.wt; }));
                                    const maxWaitAttentionTime = Math.max.apply(Math, traces.map((o) => { return o.at; }));
            
                                    const canceledShifts = traces.filter(r => r.lastState === 'cancelado').length;
        
                                    let shiftsFinished = 0;
                                    if (element.area.includes('Toma')) {
                                        shiftsFinished = traces.filter(r => r.lastState === 'terminado').length;
                                    }
                                    else if (element.area === 'Resultados') {
                                        shiftsFinished = traces.filter(r => r.lastState === 'terminado').length;
                                    }
                                    else {
                                        shiftsFinished = traces.filter(r => r.lastState === 'espera toma').length;
                                    }
                                    
            
                                    const sumWaitTime = traces.reduce((accumulator, object) => {
                                        return accumulator + object.wt;
                                    }, 0);
            
                                    const sumAttentionTime = traces.reduce((accumulator, object) => {
                                        return accumulator + object.at;
                                    }, 0);
            
                                    const sumServiceTime = traces.reduce((accumulator, object) => {
                                        return accumulator + object.st;
                                    }, 0);
                                    
                                    const averageWaitTime = traces.length === 0 ? 0 : sumWaitTime / traces.length;
                                    const averageAttentionTime = traces.length === 0 ? 0 : sumAttentionTime / traces.length;
                                    const averageServiceTime = traces.length === 0 ? 0 : sumServiceTime / traces.length;

                                    resum.push({
                                        time: key,
                                        sucursal: suc.name,
                                        area: element.area,
                                        shiftsCreated: traces.length,
                                        canceledShifts: canceledShifts,
                                        shiftsFinished: shiftsFinished,
                                        averageWaitTime: TraceHistoryController.msToTime(averageWaitTime),
                                        averageAttentionTime: TraceHistoryController.msToTime(averageAttentionTime),
                                        averageServiceTime: TraceHistoryController.msToTime(averageServiceTime),
                                        maxWaitTime: TraceHistoryController.msToTime(maxWaitTime),
                                        maxWaitAttentionTime: TraceHistoryController.msToTime(maxWaitAttentionTime)
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return resum;
        }
        catch (error: any) {
            throw error;
        }
    }

    static async detailedReport(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const query: any[] = [ 
                { createdAt: { '$gte': startDate } }, 
                { createdAt: { '$lte': finalDate } },  
            ];
            
            if (sucursal) {
                let str = diacriticSensitiveRegex(sucursal);
                query.push({ sucursal: { $regex: `^${str}$`, $options: "i" } });
            }

            let query2= {};
            if (area) {
                let str = diacriticSensitiveRegex(area);
                query2 = { area: { $regex: `^${str}$`, $options: "i" } };
            }

            const res = await TraceHistory.aggregate([
                {
                    $match: { '$and': query }
                },
                {
                    $lookup: {
                         from: "TurnHistory",
                         localField: "idTurn",
                         foreignField: "_id",
                         as: "dataTurn"
                    }
                },
                { $unwind : "$dataTurn" },
                {   $project: { 
                        idTurn: 1,
                        _id: 1,
                        turn: 1,
                        startDate: 1,
                        finalDate: 1,
                        state: 1,
                        sucursal: 1,
                        ubication: 1,
                        username: 1,
                        sourceSection: 1,
                        area: "$dataTurn.area"
                    } 
                },
                {
                    $match: query2
                }
            ]);

            //Creacion de matriz de milisegundos
            const sucursals: string[] = [];
            const table: any[] = [];
            res.forEach(element => {
                const start = moment(element.startDate);
                const final = moment(element.finalDate);

                table.push({
                    idTurn: element.idTurn,
                    sucursal: element.sucursal,
                    area: element.area,
                    turn: element.turn,
                    state: element.state,
                    ubication: element.ubication,
                    username: element.username,
                    timeMili: final.diff(start),
                    startDate: element.startDate,
                    finalDate: element.finalDate,
                    sourceSection: element.sourceSection
                });

                if (!sucursals.includes(element.sucursal)) {
                    sucursals.push(element.sucursal);
                }
            });

            // console.log(table.length);
            
            let resum: any[] = [];
            sucursals.forEach(suc => {
                // console.log(`=============${suc}=============`);
                const dataSucursal = table.filter(r => r.sucursal === suc);
                const shifts = dataSucursal.filter(r => r.state === 'espera');
                // console.log(`Suc: ${dataSucursal.length}`);
                // console.log(`Turns: ${shifts.length}`);
                
                shifts.forEach(turn => {
                    // console.log(`------------${turn.turn}-----------`);
                    // const traces = dataSucursal.filter(r => 
                    //     r.turn === turn.turn && 
                    //     moment(turn.startDate).format('YYYY-MM-DD') === moment(r.startDate).format('YYYY-MM-DD'));
                    const traces = dataSucursal.filter(r => r.idTurn.toString() === turn.idTurn.toString());
                        
                        
                        // if (traces.length && traces[0].turn === 'L001') {
                        //     const data = {
                        //         turn: traces[0].turn,
                        //         date: moment(traces[0].startDate).format('YYYY-MM-DD')
                        //     };
                        //     console.log(data);
                        // }

                        let waitTime: number = 0;
                        let attentionTime: number = 0;
                        let hourFinish: string = '';
                        let hourCall: string = '';
                        let hourInit: string = '';
                        let dateInit: string =  moment(turn.startDate).format('YYYY-MM-DD');
                        let user: string = '';
                        let module: string = '';

                        const tracesReception = traces.filter(r => r.sourceSection === 'recepcion');
                        const tracesToma = traces.filter(r => r.sourceSection === 'toma');

                        const lastStateReception = tracesReception[tracesReception.length - 1].state;

                        let lastStateToma = '';
                        if (tracesToma.length && tracesToma[tracesToma.length - 1]) {
                            lastStateToma = tracesToma[tracesToma.length - 1].state;
                        }

                        tracesReception.forEach(element => {
                            if (element.state === 'en atencion') {
                                hourCall = moment(element.startDate).format('HH:mm:ss');
                                user = element.username;
                                module = element.ubication;
                            }

                            if (element.state === 'espera toma' || element.state === 'terminado' || element.state === 'cancelado'|| element.state === 'en atencion') {
                                if (element.state === 'espera toma') {
                                    tracesToma.unshift(element);
                                }
                                hourFinish =  element.state !== 'en atencion' ? moment(element.startDate).format('HH:mm:ss') : moment(element.finalDate).format('HH:mm:ss');
                            }

                            if (element.state === 're-call') {
                                const resFinish = tracesReception.find(r => r.turn === element.turn && (r.state === 'terminado' || r.state === 'espera toma') && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                if (resFinish) {
                                    attentionTime += element.timeMili;
                                }
                                else {
                                    const resCancel = tracesReception.find(r => r.turn === element.turn && r.state === 'cancelado' && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                    if (resCancel) {
                                        waitTime += element.timeMili;
                                    }
                                }
                            }

                            if (element.state === 'espera') {
                                hourInit = moment(element.startDate).format('HH:mm:ss');
                                waitTime += element.timeMili;
                            }

                            if (element.state === 'en atencion') {
                                attentionTime += element.timeMili;
                            }
                        });

                        if (hourFinish === '' && tracesReception.length) {
                            hourFinish = moment(tracesReception[0].startDate).hour(23).minute(59).second(59).millisecond(999).format('HH:mm:ss');
                            attentionTime = moment(tracesReception[0].startDate).hour(23).minute(59).second(59).millisecond(999).diff(tracesReception[0].startDate)
                        }

                        resum.push({
                            sucursal: turn.sucursal,
                            turn: turn.turn,
                            area: turn.area,
                            date: dateInit,
                            module: module,
                            user: user,
                            beginningTime: hourInit,
                            callingTime: hourCall,
                            endingTime: hourFinish,
                            waitTime: TraceHistoryController.msToTime(waitTime),
                            attentionTime: TraceHistoryController.msToTime(attentionTime),
                            wt: waitTime,
                            at: attentionTime,
                            st: waitTime + attentionTime,
                            lastState: lastStateReception,
                            startDate: turn.startDate
                        });

                        if (turn.area !== 'Resultados') {
                            waitTime = 0;
                            attentionTime = 0;
                            hourFinish = '';
                            hourCall = '';
                            hourInit = '';
                            user = '';
                            module = '';

                            const resInit = tracesReception.find(r => r.state === 'espera toma');
                            if (resInit) {
                                hourInit = moment(resInit.startDate).format('HH:mm:ss');
                                waitTime += resInit.timeMili;
                            }

                            tracesToma.forEach(element => {
                                if (element.state === 'en toma') {
                                    hourCall = moment(element.startDate).format('HH:mm:ss');
                                    user = element.username;
                                    module = element.ubication;
                                    attentionTime += element.timeMili;
                                }

                                if (element.state === 'terminado' || element.state === 'cancelado') {
                                    hourFinish = moment(element.startDate).format('HH:mm:ss');
                                }

                                if (element.state === 're-call') {
                                    const resFinish = tracesToma.find(r => r.turn === element.turn && r.state === 'terminado' && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                    if (resFinish) {
                                        attentionTime += element.timeMili;
                                    }
                                    else {
                                        const resCancel = tracesToma.find(r => r.turn === element.turn && (r.state === 'cancelado' || r.state === 'espera toma') && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                        if (resCancel) {
                                            waitTime += element.timeMili;
                                        }
                                    }
                                }
                            });

                            if (hourFinish === '' && tracesToma.length) {
                                if (hourCall !== '') {
                                    hourFinish = moment(tracesToma[0].startDate).hour(23).minute(59).second(59).millisecond(999).format('HH:mm:ss');
                                    attentionTime = moment(tracesToma[0].startDate).hour(23).minute(59).second(59).millisecond(999).diff(tracesToma[0].startDate)
                                }
                                else {
                                    waitTime = moment(tracesToma[0].startDate).hour(23).minute(59).second(59).millisecond(999).diff(tracesToma[0].startDate)
                                }
                            }

                            resum.push({
                                sucursal: turn.sucursal,
                                turn: turn.turn,
                                area: `Toma ${turn.area}`,
                                date: dateInit,
                                module: module,
                                user: user,
                                beginningTime: hourInit,
                                callingTime: hourCall,
                                endingTime: hourFinish,
                                waitTime: TraceHistoryController.msToTime(waitTime),
                                attentionTime: TraceHistoryController.msToTime(attentionTime),
                                wt: waitTime,
                                at: attentionTime,
                                st: waitTime + attentionTime,
                                lastState: lastStateToma,
                                startDate: turn.startDate
                            });                            
                        }
                });
                
            });


            const auxResum = resum.sort(( a, b ) => {
                if ( moment(a.startDate) < moment(b.startDate) ){
                  return -1;
                }
                if ( moment(a.startDate) > moment(b.startDate) ){
                  return 1;
                }
                return 0;
            });

            resum = auxResum;

            return resum;
        } catch (error: any) {
            throw error;
        }
    }

    static msToTime(duration: number) {
        const milliseconds = parseInt(((duration % 1000) / 100).toString());
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
        // const days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 30);
      
        // const d = (days < 10) ? "0" + days : days;
        const h = (hours < 10) ? "0" + hours : hours;
        const m = (minutes < 10) ? "0" + minutes : minutes;
        const s = (seconds < 10) ? "0" + seconds : seconds;
      
        return h + ":" + m + ":" + s + ":" + milliseconds;
    }
}

export default TraceHistoryController;