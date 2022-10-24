import { CronJob } from 'cron';
import moment from "moment";
let xl = require('excel4node');
import nodemailer from "nodemailer";
import traceHistoryController from "../controllers/traceHistoryController";

export default class CronTask {
  constructor(fun: Function[]) {
    for (let index = 0; index < fun.length; index++) {
        fun[index]();
    }
  }
}

function sendReports(startDate: moment.Moment, selectedDate: moment.Moment) {
    

    const wb = new xl.Workbook();
    const ws1 = wb.addWorksheet('Sheet 1');
    const ws2 = wb.addWorksheet('Sheet 2');
    const ws3 = wb.addWorksheet('Sheet 3');
    const style = wb.createStyle({
        font: {
            size: 12,
        }
    });
    
    setTimeout(async () => {
        const generalReport = await traceHistoryController.generalReport(startDate.toDate(), selectedDate.toDate());
        const HEADER_ROW = [
            {
              value: 'Sucursal',
              fontWeight: 'bold'
            },
            {
              value: 'Area',
              fontWeight: 'bold'
            },
            {
              value: 'Turnos Creados',
              fontWeight: 'bold'
            },
            {
              value: 'Turnos cancelados',
              fontWeight: 'bold'
            },
            {
                value: 'Turnos atendidos',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo promedio de espera',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo promedio de atención',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo máximo de espera',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo máximo de atención',
                fontWeight: 'bold'
            },
        ]
    
        for (let index = 0; index < HEADER_ROW.length; index++) {
            const column = HEADER_ROW[index];
            ws1.cell(1, index + 1).string(column.value).style(style);
        }
    
        for (let fila = 0; fila < generalReport.length; fila++) {
            const row = generalReport[fila];
            let column = 1;
            for (const property in row) {
                ws1.cell(fila + 2, column).string(row[property].toString()).style(style);
                column++;
            }
        }
        console.log('Ok General');
    }, 1000 * 60 * 0);

    setTimeout(async () => {
        const generalReportByHour = await traceHistoryController.generalReportByHour(startDate.toDate(), selectedDate.toDate());
        const HEADER_ROW_BY_HOUR = [
            {
                value: 'Hora',
                fontWeight: 'bold'
            },
            {
            value: 'Sucursal',
            fontWeight: 'bold'
            },
            {
            value: 'Area',
            fontWeight: 'bold'
            },
            {
            value: 'Turnos Creados',
            fontWeight: 'bold'
            },
            {
            value: 'Turnos cancelados',
            fontWeight: 'bold'
            },
            {
                value: 'Turnos atendidos',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo promedio de espera',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo promedio de atención',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo promedio de servicio',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo máximo de espera',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo máximo de atención',
                fontWeight: 'bold'
            },
        ]

        for (let index = 0; index < HEADER_ROW_BY_HOUR.length; index++) {
            const column = HEADER_ROW_BY_HOUR[index];
            ws2.cell(1, index + 1).string(column.value).style(style);
        }

        for (let fila = 0; fila < generalReportByHour.length; fila++) {
            const row = generalReportByHour[fila];
            let column = 1;
            for (const property in row) {
                ws2.cell(fila + 2, column).string(row[property].toString()).style(style);
                column++;
            }
        }

        console.log('Ok By Hour');
    }, 1000 * 60 * 2);

    setTimeout(async () => {
        const detailReport = await traceHistoryController.detailedReport(startDate.toDate(), selectedDate.toDate());

        const HEADER_ROW_DETAIL = [
            {
            value: 'Sucursal',
            fontWeight: 'bold'
            },
            {
                value: 'Turno',
                fontWeight: 'bold'
            },
            {
            value: 'Area',
            fontWeight: 'bold'
            },
            {
            value: 'Fecha',
            fontWeight: 'bold'
            },
            {
            value: 'Puesto',
            fontWeight: 'bold'
            },
            {
                value: 'Usuario',
                fontWeight: 'bold'
            },
            {
                value: 'Hora de emisión',
                fontWeight: 'bold'
            },
            {
                value: 'Hora de llamado',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo de espera',
                fontWeight: 'bold'
            },
            {
                value: 'Tiempo de atención',
                fontWeight: 'bold'
            },
        ]

        for (let index = 0; index < HEADER_ROW_DETAIL.length; index++) {
            const column = HEADER_ROW_DETAIL[index];
            ws3.cell(1, index + 1).string(column.value).style(style);
        }

        for (let fila = 0; fila < detailReport.length; fila++) {
            const row = detailReport[fila];
            let column = 1;
            for (const property in row) {
                if (property !== 'wt' && property !== 'at' && property !== 'st' && property !== 'lastState' && property !== 'startDate') {
                    ws3.cell(fila + 2, column).string(row[property].toString()).style(style);
                    column++;  
                }
            }
        }

        console.log('Ok Detail');

        wb.write('./src/reports/reportes.xlsx');



        let transporter = nodemailer.createTransport({
            host: "in-v3.mailjet.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
            user: '7e94ae16e5b7f680ec64c77cede0cd2e', // generated ethereal user
            pass: 'ad9bead630772f2b44bb9710f7654899', // generated ethereal password
            },
        });

        const body = `Formato de Tiempo: Horas:Minutos:Segundos:Milisegundos \n
    Tiempo de espera: Tiempo en que el paciente demora en ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n
    Tiempo de atencion: Tiempo en que el paciente demora en ser atendido en un area determinada [recepcion o area de toma de muestras].\n
    Tiempo promedio de servicio: Tiempo promedio en que el paciente demora en ser atendido en el area de toma de muestras.\n
    Tiempo promedio de atencion: Tiempo promedio en que el paciente demora en ser atendido en el area de recepcion para toma de sus datos.\n
    Tiempo promedio de espera: Tiempo promedio en que el paciente demora ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n`;

        let info = await transporter.sendMail({
            from: '"Ing. Roberto Castillo Medina 🚀" <resultados@exaktadiagnostikos.com.mx>', // sender address
            to: "roberto.castillo@exakta.mx, israel.ruiz@exakta.mx", // list of receivers
            subject: `Reportes turnero [${startDate.format('DD-MM-YYYY')} - ${selectedDate.format('DD-MM-YYYY')}]`, // Subject line
            text: body, // plain text body
            attachments: [
                {   // file on disk as an attachment
                    filename: 'reportes.xlsx',
                    path: './src/reports/reportes.xlsx' // stream this file
                }
            ]
        });

        console.log("Message sent: %s", info.messageId);
    }, 1000 * 60 * 4);
}

async function sendReportGeneral(startDate: moment.Moment, selectedDate: moment.Moment) {
    const generalReport = await traceHistoryController.generalReport(startDate.toDate(), selectedDate.toDate());

    const wb = new xl.Workbook();
    const ws1 = wb.addWorksheet('Sheet 1');
    const style = wb.createStyle({
        font: {
            size: 12,
        }
    });

    const HEADER_ROW = [
        {
          value: 'Sucursal',
          fontWeight: 'bold'
        },
        {
          value: 'Area',
          fontWeight: 'bold'
        },
        {
          value: 'Turnos Creados',
          fontWeight: 'bold'
        },
        {
          value: 'Turnos cancelados',
          fontWeight: 'bold'
        },
        {
            value: 'Turnos atendidos',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo promedio de espera',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo promedio de atención',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo máximo de espera',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo máximo de atención',
            fontWeight: 'bold'
        },
    ]

    for (let index = 0; index < HEADER_ROW.length; index++) {
        const column = HEADER_ROW[index];
        ws1.cell(1, index + 1).string(column.value).style(style);
    }

    for (let fila = 0; fila < generalReport.length; fila++) {
        const row = generalReport[fila];
        let column = 1;
        for (const property in row) {
            ws1.cell(fila + 2, column).string(row[property].toString()).style(style);
            column++;
        }
    }
    console.log('Ok General');

    wb.write('./src/reports/general.xlsx');



    let transporter = nodemailer.createTransport({
        host: "in-v3.mailjet.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: '7e94ae16e5b7f680ec64c77cede0cd2e', // generated ethereal user
          pass: 'ad9bead630772f2b44bb9710f7654899', // generated ethereal password
        },
    });

    const body = `Formato de Tiempo: Horas:Minutos:Segundos:Milisegundos \n
Tiempo de espera: Tiempo en que el paciente demora en ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n
Tiempo de atencion: Tiempo en que el paciente demora en ser atendido en un area determinada [recepcion o area de toma de muestras].\n
Tiempo promedio de servicio: Tiempo promedio en que el paciente demora en ser atendido en el area de toma de muestras.\n
Tiempo promedio de atencion: Tiempo promedio en que el paciente demora en ser atendido en el area de recepcion para toma de sus datos.\n
Tiempo promedio de espera: Tiempo promedio en que el paciente demora ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n`;

    let info = await transporter.sendMail({
        from: '"Ing. Roberto Castillo Medina 🚀" <resultados@exaktadiagnostikos.com.mx>', // sender address
        to: "roberto.castillo@exakta.mx, israel.ruiz@exakta.mx", // list of receivers
        subject: `Reportes turnero [${startDate.format('DD-MM-YYYY')} - ${selectedDate.format('DD-MM-YYYY')}]`, // Subject line
        text: body, // plain text body
        attachments: [
            {   // file on disk as an attachment
                filename: 'general.xlsx',
                path: './src/reports/general.xlsx' // stream this file
            }
        ]
    });

    console.log("Message sent: %s", info.messageId);
}

async function sendReportByHour(startDate: moment.Moment, selectedDate: moment.Moment) {
    const wb = new xl.Workbook();
    const ws1 = wb.addWorksheet('Sheet 1');
    const style = wb.createStyle({
        font: {
            size: 12,
        }
    });

    

    wb.write('./src/reports/30min.xlsx');



    let transporter = nodemailer.createTransport({
        host: "in-v3.mailjet.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: '7e94ae16e5b7f680ec64c77cede0cd2e', // generated ethereal user
          pass: 'ad9bead630772f2b44bb9710f7654899', // generated ethereal password
        },
    });

    const body = `Formato de Tiempo: Horas:Minutos:Segundos:Milisegundos \n
Tiempo de espera: Tiempo en que el paciente demora en ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n
Tiempo de atencion: Tiempo en que el paciente demora en ser atendido en un area determinada [recepcion o area de toma de muestras].\n
Tiempo promedio de servicio: Tiempo promedio en que el paciente demora en ser atendido en el area de toma de muestras.\n
Tiempo promedio de atencion: Tiempo promedio en que el paciente demora en ser atendido en el area de recepcion para toma de sus datos.\n
Tiempo promedio de espera: Tiempo promedio en que el paciente demora ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n`;

    let info = await transporter.sendMail({
        from: '"Ing. Roberto Castillo Medina 🚀" <resultados@exaktadiagnostikos.com.mx>', // sender address
        to: "roberto.castillo@exakta.mx, israel.ruiz@exakta.mx", // list of receivers
        subject: `Reportes turnero [${startDate.format('DD-MM-YYYY')} - ${selectedDate.format('DD-MM-YYYY')}]`, // Subject line
        text: body, // plain text body
        attachments: [
            {   // file on disk as an attachment
                filename: '30min.xlsx',
                path: './src/reports/30min.xlsx' // stream this file
            }
        ]
    });

    console.log("Message sent: %s", info.messageId);
}

async function sendReportDetail(startDate: moment.Moment, selectedDate: moment.Moment) {
    const wb = new xl.Workbook();
    const ws1 = wb.addWorksheet('Sheet 1');
    const style = wb.createStyle({
        font: {
            size: 12,
        }
    });

    const detailReport = await traceHistoryController.detailedReport(startDate.toDate(), selectedDate.toDate());

    const HEADER_ROW_DETAIL = [
        {
          value: 'Sucursal',
          fontWeight: 'bold'
        },
        {
            value: 'Turno',
            fontWeight: 'bold'
        },
        {
          value: 'Area',
          fontWeight: 'bold'
        },
        {
          value: 'Fecha',
          fontWeight: 'bold'
        },
        {
          value: 'Puesto',
          fontWeight: 'bold'
        },
        {
            value: 'Usuario',
            fontWeight: 'bold'
        },
        {
            value: 'Hora de emisión',
            fontWeight: 'bold'
        },
        {
            value: 'Hora de llamado',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo de espera',
            fontWeight: 'bold'
        },
        {
            value: 'Tiempo de atención',
            fontWeight: 'bold'
        },
    ]

    for (let index = 0; index < HEADER_ROW_DETAIL.length; index++) {
        const column = HEADER_ROW_DETAIL[index];
        ws1.cell(1, index + 1).string(column.value).style(style);
    }

    for (let fila = 0; fila < detailReport.length; fila++) {
        const row = detailReport[fila];
        let column = 1;
        for (const property in row) {
            if (property !== 'wt' && property !== 'at' && property !== 'st' && property !== 'lastState' && property !== 'startDate') {
                ws1.cell(fila + 2, column).string(row[property].toString()).style(style);
                column++;  
            }
        }
    }

    console.log('Ok Detail');

    wb.write('./src/reports/detalle.xlsx');



    let transporter = nodemailer.createTransport({
        host: "in-v3.mailjet.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: '7e94ae16e5b7f680ec64c77cede0cd2e', // generated ethereal user
          pass: 'ad9bead630772f2b44bb9710f7654899', // generated ethereal password
        },
    });

    const body = `Formato de Tiempo: Horas:Minutos:Segundos:Milisegundos \n
Tiempo de espera: Tiempo en que el paciente demora en ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n
Tiempo de atencion: Tiempo en que el paciente demora en ser atendido en un area determinada [recepcion o area de toma de muestras].\n
Tiempo promedio de servicio: Tiempo promedio en que el paciente demora en ser atendido en el area de toma de muestras.\n
Tiempo promedio de atencion: Tiempo promedio en que el paciente demora en ser atendido en el area de recepcion para toma de sus datos.\n
Tiempo promedio de espera: Tiempo promedio en que el paciente demora ser llamado a atencion de un area determinada [recepcion o area de toma de muestras].\n`;

    let info = await transporter.sendMail({
        from: '"Ing. Roberto Castillo Medina 🚀" <resultados@exaktadiagnostikos.com.mx>', // sender address
        to: "roberto.castillo@exakta.mx, israel.ruiz@exakta.mx", // list of receivers
        subject: `Reportes turnero [${startDate.format('DD-MM-YYYY')} - ${selectedDate.format('DD-MM-YYYY')}]`, // Subject line
        text: body, // plain text body
        attachments: [
            {   // file on disk as an attachment
                filename: 'detalle.xlsx',
                path: './src/reports/detalle.xlsx' // stream this file
            }
        ]
    });

    console.log("Message sent: %s", info.messageId);
}

export function reportWeek() {
    //0 0 * * * -> todos los dias a las 12AM
    //0 3 * * 1 (a las 3AM todos los lunes)
    const cronJob: CronJob = new CronJob('0 3 * * 1', async () => {
        try {
            console.log('HOLA FULL');
            
            const currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
            const startDate = currentDate.add(-(currentDate.date() - 1), 'day');
            const selectedDate = moment();
            
            sendReports(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportWeekGeneral() {
    //0 0 * * * -> todos los dias a las 12AM
    //0 3 * * 1 (a las 3AM todos los lunes)
    const cronJob: CronJob = new CronJob('0 3 * * 1', async () => {
        try {
            console.log('HOLA GENERAL');
            
            const currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
            const startDate = currentDate.add(-(currentDate.date() - 1), 'day');
            const selectedDate = moment();
            
            sendReportGeneral(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportWeekByHour() {
    //0 0 * * * -> todos los dias a las 12AM
    //0 3 * * 1 (a las 3AM todos los lunes)
    const cronJob: CronJob = new CronJob('2 3 * * 1', async () => {
        try {
            console.log('HOLA BY HOUR');
            const currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
            const startDate = currentDate.add(-(currentDate.date() - 1), 'day');
            const selectedDate = moment();
            
            sendReportByHour(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportWeekDetail() {
    //0 0 * * * -> todos los dias a las 12AM
    //0 3 * * 1 (a las 3AM todos los lunes)
    const cronJob: CronJob = new CronJob('4 3 * * 1', async () => {
        try {
            console.log('HOLA DETALLE');
            const currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
            const startDate = currentDate.add(-(currentDate.date() - 1), 'day');
            const selectedDate = moment();
            
            sendReportDetail(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportMount() {
    // 0 0 1 * * (cada primero de mes)
    const cronJob: CronJob = new CronJob('15 3 1 * *', async () => {
        try {
            const selectedDate = moment().add(-1, "day");
            const aux = moment().add(-1, "day");
            const startDate = aux.add(-(aux.date() - 1), 'day');

            sendReports(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportMountGeneral() {
    // 0 0 1 * * (cada primero de mes)
    const cronJob: CronJob = new CronJob('6 3 1 * *', async () => {
        try {
            const selectedDate = moment().add(-1, "day");
            const aux = moment().add(-1, "day");
            const startDate = aux.add(-(aux.date() - 1), 'day');

            sendReportGeneral(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportMountByHour() {
    // 0 0 1 * * (cada primero de mes)
    const cronJob: CronJob = new CronJob('8 3 1 * *', async () => {
        try {
            const selectedDate = moment().add(-1, "day");
            const aux = moment().add(-1, "day");
            const startDate = aux.add(-(aux.date() - 1), 'day');

            sendReportByHour(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function reportMountDetail() {
    // 0 0 1 * * (cada primero de mes)
    const cronJob: CronJob = new CronJob('10 3 1 * *', async () => {
        try {
            const selectedDate = moment().add(-1, "day");
            const aux = moment().add(-1, "day");
            const startDate = aux.add(-(aux.date() - 1), 'day');

            sendReportDetail(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}