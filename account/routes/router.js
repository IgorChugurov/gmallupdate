'use strict';
var api = require('../controllers/api');
var middleware = require('../middleware')
var apiPN = require('../controllers/api/pn');
var apiRN = require('../controllers/api/rn');
var apiAct = require('../controllers/api/act');
var apiZakaz = require('../controllers/api/zakaz');
var apiSA = require('../controllers/api/sa');//это инвентаризация для складов
var apiASA = require('../controllers/api/asa');// это инвентаризация для контрагентов
var apiBalance = require('../controllers/api/balance');
var apigetDocs = require('../controllers/api/getDocs');
var apiMoney = require('../controllers/api/money');
module.exports = function(router) {
    router.get('/api/bookkeep/getAccounts',middleware.getStore,api.getAccounts)

    router.get('/api/bookkeep/pn/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiPN.hold)
    router.get('/api/bookkeep/pn/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiPN.cancel)

    router.get('/api/bookkeep/zakaz/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiZakaz.hold)
    router.get('/api/bookkeep/zakaz/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiZakaz.cancel)
    router.post('/api/bookkeep/Zakaz/createByAPI',middleware.getStore,apiZakaz.createByAPI)
    router.get('/api/bookkeep/Zakaz/cancelByAPI/:id',middleware.getStore,apiZakaz.cancelByAPI)



    router.get('/api/bookkeep/rn/reserveHold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.reserveHold)
    router.get('/api/bookkeep/rn/reserveCancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.reserveCancel)
    router.get('/api/bookkeep/rn/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.hold)
    router.get('/api/bookkeep/rn/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.cancel)
    router.post('/api/bookkeep/Rn/createByAPI',middleware.getStore,apiRN.createByAPI)
    router.post('/api/bookkeep/Rn/deleteByAPI',middleware.getStore,apiRN.deleteByAPI)

    router.post('/api/bookkeep/Rn/createByAPIFromSite',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.createByAPIFromSite)
    router.post('/api/bookkeep/Rn/cancelByAPIFromSite',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.cancelByAPIFromSite)
    router.post('/api/bookkeep/Rn/checkPriceForSaleInRn',middleware.getStore,apiRN.checkPriceForSaleInRn)
    router.post('/api/bookkeep/Rn/holdByAPIFromSite',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.holdByAPIFromSite)
    router.post('/api/bookkeep/Rn/cancelZakazByAPIFromSite',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiRN.cancelZakazByAPIFromSite)


    router.get('/api/bookkeep/act/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiAct.hold)
    router.get('/api/bookkeep/act/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiAct.cancel)

    router.get('/api/bookkeep/sa/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.hold)
    router.get('/api/bookkeep/sa/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.cancel)
    router.get('/api/bookkeep/sa/diff/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.diff)
    router.get('/api/bookkeep/sa/makeBalances/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.makeBalances)
    router.get('/api/bookkeep/sa/makeBalancesForExcel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.makeBalancesForExcel)
    router.get('/api/bookkeep/sa/setEmpty/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiSA.setEmpty)
    router.get('/api/bookkeep/warehouse/:start/:end',middleware.getStore,apiSA.warehouseSaldo)

    router.get('/api/bookkeep/balance/:date/:virtualAccount',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiBalance.balance)
    router.get('/api/bookkeep/turnover/:type/:contrAgent/:dateStart/:dateEnd/:virtaulAccount',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiBalance.turnover)


    router.get('/api/bookkeep/closePeriod/:date/:virtualAccount',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiBalance.closePeriod)

    router.get('/api/bookkeep/asa/makeBalances/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiASA.makeBalances)
    router.get('/api/bookkeep/asa/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiASA.hold)
    router.get('/api/bookkeep/asa/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiASA.cancel)
    router.get('/api/bookkeep/asa/diff/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiASA.diff)
    router.get('/api/bookkeep/getDocs/:type/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apigetDocs.getDocs)

    router.get('/api/bookkeep/MoneyOrder/hold/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiMoney.hold)
    router.get('/api/bookkeep/MoneyOrder/cancel/:id',middleware.getStore,middleware.getUser,middleware.checkPermissionForSeller,apiMoney.cancel)

};

