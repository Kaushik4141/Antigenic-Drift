const DataModel = require('../models/data.models');

// This function handles the logic for saving data.
exports.saveData = async (req, res) => {
  try {
    console.log('Received data:', req.body);
    
    // Create a new document using the Mongoose model and the received data
    const newData = new DataModel(req.body);
    
    // Save the document to the database
    const savedData = await newData.save();
    
    // Send a success response back
    res.status(201).json({ 
      message: 'Data saved successfully!', 
      data: savedData 
    });

  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Failed to save data.' });
  }
};