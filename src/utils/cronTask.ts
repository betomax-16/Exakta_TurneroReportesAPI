import { CronJob } from 'cron';
import moment from "moment";
import writeXlsxFile from 'write-excel-file/node';
import nodemailer from "nodemailer";
import traceHistoryController from "../controllers/traceHistoryController";

export default class CronTask {
  constructor(fun: Function[]) {
    for (let index = 0; index < fun.length; index++) {
        fun[index]();
    }
  }
}

async function createReportsAndSendEmails(startDate: moment.Moment, selectedDate: moment.Moment) {
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

    const rows: any = [];
    generalReport.forEach(row => {
        const auxRow = [];
        for (const property in row) {
            auxRow.push({
                value: row[property]
            });
        }

        rows.push(auxRow);
    });

    const data = [
        HEADER_ROW,
        ...rows
    ];

    await writeXlsxFile(data, {
        filePath: './src/reports/general.xlsx'
    })

    console.log('Ok General');
    


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

    const rowsByHour: any = [];
    generalReportByHour.forEach(row => {
        const auxRow = [];
        for (const property in row) {
            auxRow.push({
                value: row[property]
            });
        }

        rowsByHour.push(auxRow);
    });

    const dataByHour = [
        HEADER_ROW_BY_HOUR,
        ...rowsByHour
    ];

    await writeXlsxFile(dataByHour, {
        filePath: './src/reports/30min.xlsx'
    })

    console.log('Ok By Hour');




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

    const rowsDetail: any = [];
    detailReport.forEach(row => {
        const auxRow = [];
        for (const property in row) {
            if (property !== 'wt' && property !== 'at' && property !== 'st' && property !== 'lastState' && property !== 'startDate') {
                auxRow.push({
                    value: row[property]
                });
            }
        }

        rowsDetail.push(auxRow);
    });

    const dataDetail = [
        HEADER_ROW_DETAIL,
        ...rowsDetail
    ];

    await writeXlsxFile(dataDetail, {
        filePath: './src/reports/detallado.xlsx'
    })

    console.log('Ok Detail');



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
        to: "roberto.castillo@exakta.mx", // list of receivers
        subject: `Reportes turnero [${startDate.format('DD-MM-YYYY')} - ${selectedDate.format('DD-MM-YYYY')}]`, // Subject line
        text: body, // plain text body
        attachments: [
            {   // file on disk as an attachment
                filename: 'general.xlsx',
                path: './src/reports/general.xlsx' // stream this file
            },
            {   // file on disk as an attachment
                filename: '30min.xlsx',
                path: './src/reports/30min.xlsx' // stream this file
            },
            {   // file on disk as an attachment
                filename: 'detallado.xlsx',
                path: './src/reports/detallado.xlsx' // stream this file
            },
        ]
    });

    console.log("Message sent: %s", info.messageId);
}

export function reportWeek() {
    //0 0 * * * -> todos los dias a las 12AM
    //0 3 * * 1 (a las 3AM todos los lunes)
    const cronJob: CronJob = new CronJob('0 3 * * 1', async () => {
        try {
            const currentDate = moment().hour(0).minute(0).second(0).millisecond(0);
            const startDate = currentDate.add(-(currentDate.date() - 1), 'day');
            const selectedDate = moment();
            
            createReportsAndSendEmails(startDate, selectedDate);
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
    const cronJob: CronJob = new CronJob('0 0 1 * *', async () => {
        try {
            const selectedDate = moment().add(-1, "day");
            const aux = moment().add(-1, "day");
            const startDate = aux.add(-(aux.date() - 1), 'day');

            createReportsAndSendEmails(startDate, selectedDate);
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}