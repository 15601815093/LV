    function checkAll(e,list){
        var cl =   $(list).find("input[type='checkbox']");
        var check = 0
        if($(e).prop("checked")){
            check = 1;
        }
        if(check == 1){
            allCheck(cl,list)
        }else{
            allNotCheck(cl,list)
        }

    }
    function allCheck(cl,list) {
        for(var i = 0; i < cl.length; i ++){
            $(cl[i])[0].checked = true ;
        }
    }
    function allNotCheck(cl,list) {
        for(var i = 0; i < cl.length; i ++){
            $(cl[i])[0].checked = false ;
        }
    }

