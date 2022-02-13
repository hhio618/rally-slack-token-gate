module.exports = {
    setupFiles: [
        'dotenv/config'
    ],
    setupFilesAfterEnv: ['./src/mocks/jest.setup.redis-mock.js'],
}