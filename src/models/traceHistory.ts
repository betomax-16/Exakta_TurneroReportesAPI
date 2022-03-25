import { model, Schema, Document } from 'mongoose';

export interface ITraceHistory extends Document {
    idTurn: Schema.Types.ObjectId;
    turn: string; 
    startDate: Date;
    ubication: string;
    state: string;
    finalDate?: Date;
    username?: string;
    sucursal: string;
    sourceSection: string;
}

const TraceHistorySchema: Schema<ITraceHistory> = new Schema<ITraceHistory>({
    idTurn: { type: Schema.Types.ObjectId, required: true },
    turn: { type: String, required: true },
    startDate: { type: Date, required: true },
    ubication: { type: String, required: true },
    state: { type: String, required: true },
    finalDate: { type: Date },
    username: { type: String },
    sucursal: { type: String, required: true },
    sourceSection: { type: String, required: true },
},
{ timestamps: true });

export default model<ITraceHistory>('TraceHistory', TraceHistorySchema, 'TraceHistory');