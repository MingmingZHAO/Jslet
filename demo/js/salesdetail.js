(function () {
    //Create lookup dataset
    var dsPaymentTerm = jslet.data.createEnumDataset("dsPaymentTerm", "01-M/T;02-T/T");
    //------------------------------------------------------------------------------------------------------

    var dsCustomer = jslet.data.createEnumDataset("dsCustomer", "01-ABC;02-Oil Group LTD;03-Mail Group LTD");
    //------------------------------------------------------------------------------------------------------

    //Create master dataset and its fields
    var dsSaleMaster = new jslet.data.Dataset("dsSaleMaster");
    var f = jslet.data.createStringField("saleid", 8);
    f.label("Sales ID");
    dsSaleMaster.addField(f);

    f = jslet.data.createDateField("saledate");
    f.displayFormat("yyyy-MM-dd");
    f.label("Sales Date");
    dsSaleMaster.addField(f);

    f = jslet.data.createStringField("customer", 20);
    f.label("Customer");
    var lkFld = new jslet.data.LookupField();
    lkFld.lookupDataset(dsCustomer);
    f.lookupField(lkFld);
    dsSaleMaster.addField(f);

    f = jslet.data.createStringField("paymentterm", 10);
    f.label("Payment Term");
    lkFld = new jslet.data.LookupField();
    lkFld.lookupDataset(dsPaymentTerm);
    f.lookupField(lkFld);
    dsSaleMaster.addField(f);

    f = jslet.data.createStringField("comment", 20);
    f.label("Comment");
    f.displayWidth(30);
    dsSaleMaster.addField(f);
    //------------------------------------------------------------------------------------------------------

    //Create detail dataset and its fields 
    var dsSaleDetail = new jslet.data.Dataset("dsSaleDetail");
    f = jslet.data.createNumberField("seqno");
    f.label("Number");
    dsSaleDetail.addField(f);

    f = jslet.data.createStringField("product", 10);
    f.label("Product");
    dsSaleDetail.addField(f);

    f = jslet.data.createNumberField("num", 8);
    f.label("Num");
    f.displayFormat("#,##0");
    dsSaleDetail.addField(f);

    f = jslet.data.createNumberField("price", 10, 2);
    f.label("Price");
    f.displayFormat("#,##0.00");
    dsSaleDetail.addField(f);

    f = jslet.data.createNumberField("amount", 10, 2);
    f.label("Amount");
    f.formula("[num]*[price]");
    f.displayFormat("#,##0.00");
    dsSaleDetail.addField(f);

    //Important! Create "DatasetField" in master dataset, and connect to detail dataset.
    f = jslet.data.createDatasetField("details", dsSaleDetail);
    dsSaleMaster.addField(f);
    //------------------------------------------------------------------------------------------------------

    //Add data into detail dataset
    var detail1 = [{ "seqno": 1, "product": "P1", "num": 2000, "price": 11.5 },
{ "seqno": 2, "product": "P2", "num": 1000, "price": 11.5 },
{ "seqno": 3, "product": "P3", "num": 3000, "price": 11.5 },
{ "seqno": 4, "product": "P4", "num": 5000, "price": 11.5 },
{ "seqno": 5, "product": "P5", "num": 8000, "price": 11.5}];

    var detail2 = [{ "seqno": 1, "product": "M1", "num": 1, "price": 10001 },
{ "seqno": 2, "product": "M2", "num": 2, "price": 30000}];

    //Add data into master dataset
    var dataList = [{ "saleid": "200901001", "saledate": new Date(2001, 1, 1), "customer": "02", "paymentterm": "02", "details": detail1 },
{ "saleid": "200901002", "saledate": new Date(2001, 1, 1), "customer": "01", "paymentterm": "01", "details": detail2 },
{ "saleid": "200901003", "saledate": new Date(2001, 1, 1), "customer": "02", "paymentterm": "02"}];
    dsSaleMaster.dataList(dataList);
})();