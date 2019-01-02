exports.data=function (model,sum,currency,virtualAccount,balanceSide,reverceBalanceSide) {
    if(!sum){return}
    /*сворачивание остатков по контрагентам*/
    let data = model.data.find(d=>d.virtualAccount==virtualAccount)
    if(!data){
        data={
            virtualAccount:virtualAccount,
        }
        model.data.push(data)
    }
    if(!data[currency]){
        data[currency]={
            debet:0,
            credit:0
        }
    }
    data[currency][reverceBalanceSide]-=sum;
    /*если сумма перекрывался, то остаток суммы списываем на другую сторону*/
    if(data[currency][reverceBalanceSide]<0){
        data[currency][balanceSide]-=data[currency][reverceBalanceSide]
        data[currency][reverceBalanceSide]=0;
    }
}
exports.exchange=function(money,mo,virtualAccount,currency,cancel) {
    let moneyData = money.data.find(d=>d.virtualAccount==virtualAccount)
    if(!moneyData){
        moneyData={
            virtualAccount:virtualAccount,
        }
        model.data.push(moneyData)
    }
    if(!moneyData[mo.currencyDebet]){
        moneyData[mo.currencyDebet]={
            debet:0,
            credit:0
        }
    }
    if(!moneyData[mo.currencyCredit]){
        moneyData[mo.currencyCredit]={
            debet:0,
            credit:0
        }
    }
    /*console.log(moneyData[mo.currencyCredit].debet)
    console.log(moneyData,cancel)*/
    if(!cancel){
        moneyData[mo.currencyDebet].debet+=mo.debet;
        moneyData[mo.currencyCredit].debet-=mo.credit;
        if(moneyData[mo.currencyCredit].debet<0){
            return 'не достаточно '+mo.currencyCredit
        }
    }else{
        moneyData[mo.currencyDebet].debet-=mo.debet;
        moneyData[mo.currencyCredit].debet+=mo.credit;
        if(moneyData[mo.currencyDebet].debet<0){
            return 'не достаточно '+mo.currencyDebet
        }
    }
    //console.log(moneyData)
    if(!mo.diff){
        mo.diff={debet:0,credit:0}
    }
    if(!cancel){
        let currencyRate=(currency[mo.currencyDebet]&& currency[mo.currencyDebet][0])?currency[mo.currencyDebet][0]:1;
        console.log(currencyRate)
        let debet = Math.round((mo.debet/currencyRate)*100)/100
        currencyRate=(currency[mo.currencyCredit]&& currency[mo.currencyCredit][0])?currency[mo.currencyCredit][0]:1;
        console.log(currencyRate)
        let credit = Math.round((mo.credit/currencyRate)*100)/100;
        let d =Math.round((debet-credit)*100)/100 ;

        if(d>0){
            mo.diff.debet=d;
            mo.diff.credit=0;
        }else if(d<0){
            mo.diff.debet=0;
            mo.diff.credit=d;
        }else{
            mo.diff.debet=0;
            mo.diff.credit=0;
        }
    }else{
        mo.diff.debet=0;
        mo.diff.credit=0;
    }


}


/*
*ed: {
     type:'pn',
     _id:pn._id,
     name:pn.name,
     date:pn.date
     }
* */
exports.makeEntries=function(entries,acconutDebet,accountCredit,virtualAccount,sum,ed,currency) {
    try{
        if(!sum){
            throw 'нет суммы проводки' + JSON.stringify(ed)
        }
        let o={}
        o[acconutDebet]={}
        o[acconutDebet][virtualAccount]={
            debet:{
                sum:sum,
                ed: Object.assign({},ed)

            }
        }
        if(currency){
            o[acconutDebet][virtualAccount].debet.currency=currency;
        }
        entries.push(o)
        let c ={}
        c[accountCredit]={}
        c[accountCredit][virtualAccount]={
            credit:{
                sum:sum,
                ed: Object.assign({},ed)
            }
        }
        if(currency){
            c[accountCredit][virtualAccount].credit.currency=currency;
        }
        entries.push(c)
        console.log(entries.length)
    }catch(err){
        console.log(err)
        return err
    }

}

exports.getTotalSumRateAndTotalSumForSaleRate = function getTotalSumRateAndTotalSumForSaleRate(materials,currency,rnCurrency,rnCurrencyRate) {
    let  o = materials.reduce(function(o,m){
        let  materialCurrency = (m.item && m.item.currency)?m.item.currency:'UAH';
        let price = 0;
        let priceForSale = 0;
        if(rnCurrency==materialCurrency){
            price = m.price
            priceForSale = m.priceForSale
        }else{
            let materialCurrencyRate =(currency[materialCurrency]&& currency[materialCurrency][0])?currency[materialCurrency][0]:1;
            let rate =materialCurrencyRate/rnCurrencyRate;
            price = Math.round((m.price/rate)*100)/100
            priceForSale = Math.round((m.priceForSale/rate)*100)/100
        }
        o.sum += m.qty*price
        o.sumForSale +=m.qty*priceForSale
        return o;
    },{sum:0,sumForSale:0})
    return o;
}

exports.pn_getPriceAndPriceForSaleForMaterialData=function(m,data,rate){
    if(!data.price){data.price=0}
    if(!data.priceForSale){data.priceForSale=0}
    if(!data.qty){data.qty=0;}
    data.sum = data.price*data.qty;
    data.sumForSale = data.priceForSale*data.qty;
    m.priceRate=Math.round((m.price/rate)*100)/100
    m.priceForSaleRate=Math.round((m.priceForSale/rate)*100)/100
    m.sumRate = m.priceRate*m.qty
    m.sumForSaleRate = m.priceForSaleRate*m.qty
    data.qty+=m.qty;
    data.qty=Math.round(data.qty*100)/100;
    data.price = (data.qty)?Math.round(((data.sum+m.sumRate)/data.qty)*100)/100:0;
    data.priceForSale =(data.qty)? Math.round(((data.sumForSale+m.sumForSaleRate)/data.qty)*100)/100:0;
}

