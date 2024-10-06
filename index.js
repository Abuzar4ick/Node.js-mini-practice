const http = require('http')
const getBodyData = require('./util')
const { v4: uuidv4 } = require('uuid')

let books = [
    {
        id: "1",
        title: "Book n1",
        pages: 250,
        autor: "Writer 1"
    }
]

const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    if (req.url === '/books' && req.method === 'GET') {
        const resp = {
            status: 'Ok',
            books
        }
        res.writeHead(200)
        res.end(JSON.stringify(resp))
    } else if (req.url === '/books' && req.method === 'POST') {
        try {
            const data = await getBodyData(req)
            const { title, pages, autor } = JSON.parse(data)
            const newBook = {
                id: uuidv4(), // Use v4 for generating UUIDs
                title,
                pages,
                autor
            }
            books.push(newBook)
            const resp = {
                status: 'Created',
                book: newBook
            }
            res.writeHead(201)
            res.end(JSON.stringify(resp))
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'Error', message: 'Invalid input' }))
        }
    } else if (req.url.match(/\/books\/\w+/) && req.method === 'GET') {
        const id = req.url.split('/')[2]
        const book = books.find(b => b.id === id)
        if (book) {
            const resp = {
                status: 'OK',
                book
            }
            res.writeHead(200);
            res.end(JSON.stringify(resp))
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'Error', message: 'Book not found' }))
        }
    } else if (req.url.match(/\/books\/\w+/) && req.method === 'PUT') {
        const id = req.url.split('/')[2]
        const idx = books.findIndex(b => b.id === id)
        if (idx !== -1) {
            try {
                const data = await getBodyData(req)
                const { title, pages, autor } = JSON.parse(data)
                const changedBook = {
                    id: books[idx].id,
                    title: title || books[idx].title,
                    pages: pages || books[idx].pages,
                    autor: autor || books[idx].autor
                }
                books[idx] = changedBook
                const resp = {
                    status: 'OK',
                    book: changedBook
                }
                res.writeHead(200);
                res.end(JSON.stringify(resp))
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ status: 'Error', message: 'Invalid input' }))
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'Error', message: 'Book not found' }))
        }
    } else if (req.url.match(/\/books\/\w+/) && req.method === 'DELETE') {
        const id = req.url.split('/')[2]
        const initialLength = books.length
        books = books.filter(b => b.id !== id)
        if (books.length < initialLength) {
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'Deleted' }))
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ status: 'Error', message: 'Book not found' }))
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'Error', message: 'Not found' }))
    }
})

server.listen(3000, () => console.log("Server running on port: 3000"))
