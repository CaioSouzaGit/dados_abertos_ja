$(function(){
  var $j = jQuery.noConflict();
  $j('.datepicker').datepicker( {
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            dateFormat: 'mm',
            onClose: function(dateText, inst) { 
                $j(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
            }
            });
    var footerYear = $(".footer-year"),
        gastosModel = $(".gastos-model"),
        gastosSection = $(".gastos-section"),
        tweet = $(".tweet"),
        gastos = $(".gastos"),
        brasilMap = $(".brasil-map"),
        socialSection = $(".social-section"),
        ufAtual = null,
        inputSearch = $(".state-search input"),
        dataSearch = $("#data-search"),
        estados = {
            ac:["acre", "ac"],
            al:["alagoas", "al"],
            ap:["amapá", "amapa", "ap"],
            ba:["bahia", "ba"],
            ce:["ceará", "ceara", "ce"],
            df:["destrito federal", "brasília", "brasilia", "df", "br"],
            es:["espírito santo", "espirito santo", "es"],
            go:["goias", "go"],
            ma:["maranhão", "maranhao"],
            mt:["mato grosso", "mato grosso do norte", "mt"],
            ms:["mato grosso do sul", "ms"],
            mg:["Minas Gerais", "minas", "mg"],
            pa:["pará", "para", "pa"],
            pb:["paraíba", "paraiba", "pb"],
            pr:["paraná", "parana", "pr"],
            pe:["pernambuco", "pe"],
            pi:["piauí", "piaui", "pi"],
            rj:["rio de janeiro", "rio", "rj"],
            rn:["rio grande do norte", "rio grande", "rn"],
            rs:["rio grande do sul", "rs"],
            ro:["rondônia", "rondonia", "ro"],
            rr:["roraima", "rr"],
            sc:["santa catarina", "sc"],
            sp:["são paulo", "sao paulo", "sp"],
            se:["sergipe", "se"],
            to:["tocantins", "to"]
        };

    setIpInfo();
    socialSection.find(".loading").remove();
    //loadBrasilMap();

    //escuta o search
    //trabalha a url para GET
    $(".btn-search").click(function(){
        
        var data = dataSearch.val();
        //console.log(data);
        var uf = checkUf(inputSearch.val().toLowerCase());
        if(uf != null) {
            ufAtual = uf;
            gastosSection.show();
            gastosSection.append("<div class='loading'></div>");
            loadGastos("gastos/dados?estado="+uf+"&&data="+data);
        } else {
            alert("Digite um estado válido");
        }
    });
  
    $(".brasil-map").click(function(){
        
      //console.log(this.children[1].children[0]);
        
    });

    //faz a requisição GET
    //trabalha e mapeia os dados JSON que serao exibidos na tela
    function loadGastos(url)
    {
        $.getJSON({url:url,
            success: function(response) {
                gastos.html("").fadeIn();
                gastosSection.find(".loading").remove();
                response.forEach(function(item, index){
                    //console.log(item);
                    var newGastos = gastosModel.clone();
                    newGastos.bindValue("url","detalhes.html");
                    newGastos.bindValue("gastos-uf","br-uf-"+ufAtual);
                    newGastos.bindValue("gastos-orgao", item.UNIDADE);
                    newGastos.bindValue("gastos-estado-nome", estados[ufAtual][0]);
                    newGastos.bindValue("gastos-liquido", "Líquido R$"+VMasker.toMoney(item.VALORLIQ));
                    newGastos.bindValue("gastos-empenhado", "Empenhado R$"+VMasker.toMoney(item.VALOREMP));
                    newGastos.bindValue("gastos-pago", "Pago R$"+VMasker.toMoney(item.VALORPAG));
                    gastos.append(newGastos.show().get(0));
                });
                mapLinks(response, "gastos/es");
            },
            fail: function (response) {
                gastosSection.find(".loading").remove();
                console.warn("Não foi possível obter gastos");
            }
        });
    }

    function mapLinks(obj, baseUrl)
    {
        $(".pagination").remove();
        gastosSection.append(createLinks(obj, baseUrl));
        $(".pagination").find("a").click(function(event){
            event.preventDefault();
            gastosSection.append("<div class='loading'></div>");
            loadGastos(this.getAttribute("href"));
        });
    }

    function createLinks (obj, baseUrl)
    {
        var links = "<ul class='pagination'>";
        if(obj.curPg == 1) {
            links += "<li class='disabled'><a href='#' onclick='paginate'><span class='vue-left'></span></a></li>";
        } else {
            links += "<li><a href='"+baseUrl+"?pg="+(obj.curPg-1)+"'><span class='vue-left'></span></a></li>";
        }

        for(var i = 1; i <= obj.totalPg; i++) {
            if(obj.curPg == i) {
                links += "<li class='active'><a href='"+baseUrl+"?pg="+i+"&ano=2017'>"+i+"</a></li>"; 
           } else {
                links += "<li><a href='"+baseUrl+"?pg="+i+"'>"+i+"</a></li>";
           }
        }

        if(obj.curPg == obj.totalPg) {
            links += "<li class='disabled'><a href='#' onclick='paginate'><span class='vue-left'></span></a></li>";
        } else {
            links += "<li><a href='"+baseUrl+"?pg="+(obj.curPg+1)+"'><span class='vue-right'></span></a></li>";
        }

        links += "</ul>";
        return links;
    }

    function loadBrasilMap()
    {
        var randomOrgaoRequest = {
                url:"http://localhost:8000/gastos/randomTweet",
                data: {ano:"2017"},
                cache: false,
                success: function(response) {
                    if(response.user) {
                        console.info("Tweet com termo: "+response.term+" do uf "+response.uf+" foi encontrado!");
                        brasilMap.show().find(".highlight-uf").removeClass("highlight-uf");
                        socialSection.find(".loading").remove();
                        var estado =  brasilMap.find("#uf-"+response.uf);
                        var dim = estado.getDimension();
                        estado.addClass("highlight-uf");
                        tweet.bindValue("tweet-user",response.user);
                        tweet.bindValue("tweet-text",response.text);
                        setTimeout(function(){
                            tweet.css({visibility:'visible'});
                            var tweetDim = tweet.getDimension(),
                                position = {
                                    top: dim.top - tweetDim.height + dim.height/2 - 20,
                                    left: dim.left - tweetDim.width/2 + dim.width/2
                                };
                            tweet.setPosition(position);
                        },50);
                    } else {
                        console.warn("Não foi possível obter o tweet com o termo: "+response.term+" do uf "+response.uf);
                    }
                },
                fail: function() {
                    socialSection.find(".loading").remove();
                    console.warn("Não foi possível obter tweet randômico");
                }
        };
        $.getJSON(randomOrgaoRequest);
        setInterval(function(){
            $.getJSON(randomOrgaoRequest);
        },15*1000);
    }

    function setIpInfo()
    {
        $.getJSON({ url: "https://ipinfo.io/json",
            success: function(response) {
                $("#estado-search").attr("placeholder", "Um estado (ex: "+response.region+")");
            }
        });

        var ip = null;
        $.ajax({ url: "https://ipinfo.io/ip",
            success: function(response) {
                if(response.data.length) {
                    ip = response.data;
                    $.getJSON({ url: "http://api.worldweatheronline.com/premium/v1/tz.ashx",
                        data: { 
                            key: '7ddfc34b560148b59a5105121182607',
                            q: ip,
                            format: 'json',
                        },
                        success: function(response) {
                            if(response) {
                                var date = formatDate(response.data.time_zone[0].localtime);
                                footerYear.html(footerYear.html()+" - "+date);
                            }
                        }
                    });
                }
            }
        });
    }

    //funcao q mapeia o estado
    function checkUf(uf)
    {
        for (var key in estados) {
            if (estados.hasOwnProperty(key)) {
                if(estados[key].includes(uf)) {
                    return key;
                }
            }
        }
        return null;     
    }

    function formatDate(data)
    {
         var data = new Date(data);
         var dia = data.getDate();
         if (dia.toString().length == 1)
           dia = "0"+dia;
         var mes = data.getMonth()+1;
         if (mes.toString().length == 1)
           mes = "0"+mes;
         var ano = data.getFullYear();
         var hora = data.getHours();
         var min = data.getMinutes();
         if(min.toString().length == 1)
            min = "0"+min;

         return dia+"/"+mes+"/"+ano+" "+hora+":"+min;
     }

});
