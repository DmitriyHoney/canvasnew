## Инициализация
 - Склонировать проет
```sh
 git clone
```
 - установить зависимости и запустить сервер
```sh
yarn install
yarn dev
```
// Для создания зала вызвать в консоле браузера команду, (rows - кол-во рядов, cols - кол-во мест)
```sh
app.createSectorWithSeats({ rows: 3, cols: 5})
```

// Двойной клик по канвасу (канвас подсветится оранжевым) - переход в режим перемещения секторов
// Выйти из данного режима ещё раз двойной клик
