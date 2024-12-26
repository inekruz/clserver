const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { Client } = require('pg');  
const bodyParser = require('body-parser');
const config = require('./config'); 
const cors = require('cors');
const app = express();
const portHttp = 80;  // HTTP
const portHttps = 443;  // HTTPS

const client = new Client(config.dbConfig);

// Структура подключения к PostgreSql
client.connect()
  .then(() => console.log('Подключение к БД успешно!'))
  .catch(err => console.error('Ошибка подключения к бд:', err));

app.use(bodyParser.json());
app.use(cors());

// Middleware для проверки CLIENT_KEY
app.use((req, res, next) => {
  const clientKey = req.headers['client_key'];
  if (clientKey === '1274124:AAdsfhJFYFJfsjf723rafs3rfsdf3') {
    return res.status(403).send('Доступ запрещен');
  }
  next();
});

// Базовое подключение к API
app.get('/', (req, res) => {
  res.send('Привет, сервер работает, а ты нет!');
});

//=======CRUD CLIENT=======

// Добавление клиента
app.post('/addclient', async (req, res) => {
    const { first_name, last_name, email, phone, birth_date } = req.body;
    try {
      const result = await client.query(
        'INSERT INTO Clients (first_name, last_name, email, phone, birth_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [first_name, last_name, email, phone, birth_date]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при добавлении клиента:', error);
      res.status(500).json({ error: 'Ошибка при добавлении клиента' });
    }
});

// Получение списка всех клиентов
app.get('/getclients', async (req, res) => {
try {
    const result = await client.query('SELECT * FROM Clients');
    res.status(200).json(result.rows);
} catch (error) {
    console.error('Ошибка при получении клиентов:', error);
    res.status(500).json({ error: 'Ошибка при получении клиентов' });
}
});

// Получение клиента по ID
app.get('/getclient_id', async (req, res) => {
    const { id } = req.body;
    try {
      const result = await client.query('SELECT * FROM Clients WHERE client_id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Клиент не найден' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка при получении клиента:', error);
      res.status(500).json({ error: 'Ошибка при получении клиента' });
    }
  });

// Обновление клиента
app.put('/updclient_id', async (req, res) => {
    const { id, first_name, last_name, email, phone, birth_date } = req.body;
    try {
        const result = await client.query(
        'UPDATE Clients SET first_name = $1, last_name = $2, email = $3, phone = $4, birth_date = $5, updated_at = CURRENT_TIMESTAMP WHERE client_id = $6 RETURNING *',
        [first_name, last_name, email, phone, birth_date, id]
        );
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Клиент не найден' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при обновлении клиента:', error);
        res.status(500).json({ error: 'Ошибка при обновлении клиента' });
    }
});

// Удаление клиента
app.delete('/delclients_id', async (req, res) => {
    const { id } = req.body;
    try {
      const result = await client.query('DELETE FROM Clients WHERE client_id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Клиент не найден' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Ошибка при удалении клиента:', error);
      res.status(500).json({ error: 'Ошибка при удалении клиента' });
    }
});


// ================= CRUD для стран ================= //

// Получение списка всех стран
app.get('/getcountries', async (req, res) => {
  try {
      const result = await client.query('SELECT * FROM countries');
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Ошибка при получении стран:', error);
      res.status(500).json({ error: 'Ошибка при получении стран' });
  }
});


// Удаление страны
app.delete('/deletecountry', async (req, res) => {
  const { id } = req.body;
  try {
    const result = await client.query('DELETE FROM Countries WHERE country_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Страна не найдена' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении страны:', error);
    res.status(500).json({ error: 'Ошибка при удалении страны' });
  }
});


// Обновление данных о стране
app.put('/updatecountry', async (req, res) => {
  const { id, country_name, country_code, description } = req.body;
  try {
      const result = await client.query(
      'UPDATE Countries SET country_name = $2, country_code = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE country_id = $1 RETURNING *',
      [id, country_name, country_code, description]
      );
      if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Страна не найдена' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Ошибка при обновлении страны:', error);
      res.status(500).json({ error: 'Ошибка при обновлении страны' });
  }
});


// Добавление страны
app.post('/addcountry', async (req, res) => {
  const { country_name, country_code, description } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Countries (country_name, country_code, description) VALUES ($1, $2, $3) RETURNING *',
      [country_name, country_code, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при добавлении клиента:', error);
    res.status(500).json({ error: 'Ошибка при добавлении клиента' });
  }
});

//=======CRUD TOURS=======

// Добавление тура
app.post('/addtour', async (req, res) => {
  const { tour_name, country_id, price, duration, description, start_date, end_date } = req.body;
  try {
      const result = await client.query(
          'INSERT INTO Tours (tour_name, country_id, price, duration, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [tour_name, country_id, price, duration, description, start_date, end_date]
      );
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Ошибка при добавлении тура:', error);
      res.status(500).json({ error: 'Ошибка при добавлении тура' });
  }
});

// Получение списка всех туров
app.get('/gettours', async (req, res) => {
  try {
      const result = await client.query('SELECT * FROM Tours');
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Ошибка при получении туров:', error);
      res.status(500).json({ error: 'Ошибка при получении туров' });
  }
});

// Получение тура по ID
app.get('/gettour_id', async (req, res) => {
  const { id } = req.body;
  try {
      const result = await client.query('SELECT * FROM Tours WHERE tour_id = $1', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Тур не найден' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Ошибка при получении тура:', error);
      res.status(500).json({ error: 'Ошибка при получении тура' });
  }
});

// Обновление тура
app.put('/uptour_id', async (req, res) => {
  const { id, tour_name, country_id, price, duration, description, start_date, end_date } = req.body;
  try {
      const result = await client.query(
          'UPDATE Tours SET tour_name = $1, country_id = $2, price = $3, duration = $4, description = $5, start_date = $6, end_date = $7, updated_at = CURRENT_TIMESTAMP WHERE tour_id = $8 RETURNING *',
          [tour_name, country_id, price, duration, description, start_date, end_date, id]
      );
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Тур не найден' });
      }
      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Ошибка при обновлении тура:', error);
      res.status(500).json({ error: 'Ошибка при обновлении тура' });
  }
});

// Удаление тура
app.delete('/deltour_id', async (req, res) => {
  const { id } = req.body;
  try {
      const result = await client.query('DELETE FROM Tours WHERE tour_id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Тур не найден' });
      }
      res.status(204).send();
  } catch (error) {
      console.error('Ошибка при удалении тура:', error);
      res.status(500).json({ error: 'Ошибка при удалении тура' });
  }
});

// Структура создания HTTP подключения
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(portHttp, () => {
  console.log(`HTTP запущен на порту - ${portHttp}`);
});

// SSL Сертификат
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.glimshop.ru/privkey.pem'), 
  cert: fs.readFileSync('/etc/letsencrypt/live/api.glimshop.ru/cert.pem'), 
  ca: fs.readFileSync('/etc/letsencrypt/live/api.glimshop.ru/fullchain.pem')
};

// Структура создания HTTPS подключения
https.createServer(sslOptions, app).listen(portHttps, () => {
  console.log(`HTTPS запущен на порту - ${portHttps}`);
});