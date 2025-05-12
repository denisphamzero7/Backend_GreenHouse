const mongoose = require('mongoose');

const greenhouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
   
    image:{
        type: String,
        default: null,
    },
   // quản lí nhà kính
    operator :[{
      type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,  
      }],
    // các lồng nhà kính
    cages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GreenhouseCage',
      },
    ],
    // môi trường bên trong nhà kính
     // temperature: {
    //   type: Number,
    //   default: null,
    // },
    // humidity: {
    //   type: Number,
    //   default: null,
    // },
    // light: {
    //   type: Number,
    //   default: null,
    // },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    toJSON: { virtuals: true }, // Include virtual fields in JSON response
    toObject: { virtuals: true }, // Include virtual fields when converting to objects
    versionKey: false 
  }
);
greenhouseSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
// Virtual field for number of cages
greenhouseSchema.virtual('numberOfCages').get(function () {
  return this.cages.length;
});

// Middleware to update `updatedAt` before saving or updating
greenhouseSchema.pre('save', function (next) {
  this.updatedAt = Date.now(); // Optional if you want to update it manually
  next();
});

greenhouseSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() }); // Ensure updatedAt is updated
  next();
});

const Greenhouse = mongoose.model('Greenhouse', greenhouseSchema);

module.exports = Greenhouse;
