let today = new Date(2023-11-11);
let year = today.getFullYear();
let month = today.getMonth()+1;
let date = today.getDate();
let completeDate 

if(month <10 && date <10 )
completeDate = year + "-0" + month + "-0" + date ;
else if(month <10 && date >=10 )
completeDate = year + "-0" + month + "-" + date ;
else if(month >=10 && date <10 )
completeDate = year + "-" + month + "-0" + date ;
else if(month <10 && date <10 )
completeDate = year + "-" + month + "-" + date ;

console.log(completeDate);