const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically generates next sequence ID formatted as SUP-00001
 */
async function getNextLeadId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'leadId' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  const formattedSeq = String(counter.seq).padStart(5, '0');
  return `SUP-${formattedSeq}`;
}

module.exports = { Counter, getNextLeadId };
