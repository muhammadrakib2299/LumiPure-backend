require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
config.connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
