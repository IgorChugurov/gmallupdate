var unitOfMeasure=[
    "шт",
    "л",
    "кг"
]
var reestrED =[
    'pn',// приходная накладная
    'rn',// расходная накладная
    'sa',// инвентаризация
    'asaSupplier',// инвентаризация для поставщиков
]
var modelsForBD={
    Supplier:'Поставщики'
}
var typeOfContrAgents = [
    {name:'Поставщики',type:'Supplier'},
    {name:'Покупатели',type:'Customer'},
    {name:'Учредители',type:'Founder'},
    {name:'Сотрудники',type:'Worker'},
    {name:'Подотчет',type:'Contragent'},
]
var typeOfAccounts = [
    'Warehouse',
    'Cash',
    'Bank',
    'Supplier',
    'Customer',
    'Founder',
    'Worker',
    'Contragent',
    'Profit',
    'Manufacture',
    'Exchange',
    'Income',/*валовый доход*/
    'Incomework',/*валовый доход от реализации работ*/
    'Finresult',/*финансовый результат*/
    'Realcost',/*себестоимость*/
    'Realcostwork',/*себестоимость работ*/

]
var reestrEDWithNAme ={
    pn:{
        name:'Приходная накладная',
        type:'pn',
        href:'bookkeep/pns',
        sref:'frame.pns.pn'
    },
    rn:{
        name:'Расходная накладная',
        type:'pn',
        href:'bookkeep/rns',
        sref:'frame.Rn.item'},
    sa:{
        name:'Складская нвентаризация',
        type:'sa',
        href:'bookkeep/warehouse/stockadjustments',
        sref:'frame.warehouse.stockadjustments.item'
    },
    asaSupplier:{
        name:'Ивентаризация поставщики',
        type:'asaSupplier',
        href:'bookkeep/warehouse/stockadjustments',
        sref:'frame.Supplier.stockadjustments.item'
    },
    asaCustomer:{
        name:'Ивентаризация покупатели',
        type:'asaCustomer',
        sref:'frame.Customer.stockadjustments.item'
    },
    asaWorker:{
        name:'Ивентаризация сотрудники',
        type:'asaWorker',
        sref:'frame.Worker.stockadjustments.item'
    },
    asaFounder:{
        name:'Ивентаризация учрелители',
        type:'asaFounder',
        sref:'frame.Founder.stockadjustments.item'
    },
    asaContragent:{
        name:'Ивентаризация подотчет',
        type:'asaContragent',
        sref:'frame.Contragent.stockadjustments.item'
    },
    asaMoney:{
        name:'Ивентаризация денежные средства',
        type:'asaMoney',
        sref:'frame.Money.stockadjustments.item'
    },
    mo:{
        Cash_debet:{
            name: 'ПКО',
            sref:'frame.MoneyOrderCashDebet.item'
        },
        Cash_credit:{
            name: 'РКО',
            sref:'frame.MoneyOrderCashCredit.item'
        },
        Cash_exchange:{
            name: 'Касса обмен',
            sref:'frame.MoneyOrderCashExchange.item'
        },
        Bank_debet:{
            name: 'Банк приход',
            sref:'frame.MoneyOrderBankCredit.item'
        },
        Bank_credit:{
            name: 'Банк расход',
            sref:'frame.MoneyOrderBankCredit.item'
        },
        Bank_exchange:{
            name: 'Банк обмен',
            sref:'frame.MoneyOrderBankExchange.item'
        },
    },
    Cash_debet:{
        name: 'ПКО',
        sref:'frame.MoneyOrderCashDebet.item'
    },
    Cash_credit:{
        name: 'РКО',
        sref:'frame.MoneyOrderCashCredit.item'
    },

    Cash_exchange:{
        name: 'Касса обмен',
        sref:'frame.MoneyOrderCashExchange.item'
    },
    Bank_debet:{
        name: 'Банк приход',
        sref:'frame.MoneyOrderBankCredit.item'
    },
    Bank_credit:{
        name: 'Банк расход',
        sref:'frame.MoneyOrderBankCredit.item'
    },
    Bank_exchange:{
        name: 'Банк обмен',
        sref:'frame.MoneyOrderBankExchange.item'
    },
    act:{
        name:'Акт работ',
        type:'act',
        href:'bookkeep/Acts',
        sref:'frame.Act.item'},
    zakaz:{
        name:'Наряд-заказ',
        type:'zakaz',
        href:'bookkeep/ZakazManufacture',
        sref:'frame.ZakazManufacture.item'},
}

var typesOfZakaz=[
    {
        type:'order',
        name:'Продажа'
    },
    {
        type:'manufacture',
        name:'В наряд-заказ'
    },
    {
        type:'loss',
        name:'Списание'
    },
    {
        type:'return',
        name:'Возврат'
    }
]

var workingHour= {
    'UAH':400,
    'USD':12,
    'EUR':10
}


if(typeof window === 'undefined') {
    exports.reestrED=reestrED;
    exports.typeOfAccounts=typeOfAccounts;
    exports.workingHour=workingHour
}


