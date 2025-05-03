// POST route to create a new Ad
app.post('/ads', async (req, res) => {
    try {
        const newAd = new Ad(req.body);  // Create new Ad document
        await newAd.save();  // Save ad in MongoDB
        res.status(201).json(newAd);  // Return the created Ad
    } catch (error) {
        console.error('Error adding ad:', error);
        res.status(500).send('Error adding ad');
    }
});
