const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Online', 'Cheque', 'Card'],
        default: 'Cash'
    },
    receiptNumber: {
        type: String
    },
    notes: {
        type: String
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const studentSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String
    },
    
    // Academic Information
    class: {
        type: String,
        required: true,
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    board: {
        type: String,
        required: true,
        enum: ['CBSE', 'RBSE']
    },
    stream: {
        type: String,
        enum: ['Science', 'Commerce', 'Arts', 'Agriculture', 'Mathematics', 'Biology', 'NA'],
        default: 'NA'
    },
    section: {
        type: String
    },
    rollNumber: {
        type: String
    },
    
    // Fee Information
    totalFee: {
        type: Number,
        required: true,
        min: 0
    },
    feePaid: {
        type: Number,
        default: 0,
        min: 0
    },
    feeDiscount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentHistory: [paymentHistorySchema],
    
    // Parent Information
    fatherName: {
        type: String
    },
    motherName: {
        type: String
    },
    parentMobile: {
        type: String,
        match: /^[0-9]{10}$/
    },
    parentEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    
    // Additional Information
    dateOfBirth: {
        type: Date
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'],
        default: 'Unknown'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Graduated'],
        default: 'Active'
    },
    
    // System Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Virtual for pending fee
studentSchema.virtual('feePending').get(function() {
    return this.totalFee - this.feePaid - this.feeDiscount;
});

// Virtual for payment status
studentSchema.virtual('feeStatus').get(function() {
    const pending = this.feePending;
    if (pending <= 0) return 'Paid';
    if (this.feePaid > 0) return 'Partial';
    return 'Pending';
});

// Method to add payment
studentSchema.methods.addPayment = function(paymentData) {
    this.paymentHistory.push(paymentData);
    this.feePaid += paymentData.amount;
    return this.save();
};

// Index for faster searches
studentSchema.index({ name: 'text', mobile: 'text', email: 'text' });
studentSchema.index({ class: 1, board: 1 });
studentSchema.index({ status: 1 });

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);