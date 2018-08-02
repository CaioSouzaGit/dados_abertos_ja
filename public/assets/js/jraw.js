/*
	Define uma 'classe anônima' recebendo um registrador de variáveis global (window) e uma função
	para inicialização. Dessa forma mantemos um cache da variável window só para o JRAW
*/

(function(global, boot){

	//Força o uso do ECMAScript >= 5. Variáveis precisam ser declaradas com var
	"use strict";
	boot(global);

})(window, function(global){

	"use strict";

	//Definição incial, funções e variáveis iniciais
	var document = global.document,
		arr = [],
		push = arr.push,
		slice = arr.slice,
		pageReady = false,
		type = function(value) {return (typeof value);},
		isNode = function(value) {
			if(value && type(value) === "object") return value.nodeType ? true : false;
			return false;
		},
		DOMContentLoaded = function(){
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			JRAW.isReady = true;
			this.call();
		},
		Ajax = function(request) {

    		//Atributos padrão
			var self = this,
				defaultRequest = {
				async:true,
				url:undefined,
				cache:true,
				cors: false,
				type:'GET',
				data:null,
				charset:"utf-8",
				dataType:"html",
				timeout:0,
				credentials:null,
				success:function(){},
				fail:function(){},
				done:function(){}		
			};
			this.xhr = null;

			//Inicializa as configurações do Ajax
			this.init = function(request) {
				if(type(request) == "object") {
					this.request = JRAW.extend(defaultRequest, request);
				} else {
					this.request = null;
				}
			};

			//Envia a requisição HTTP
			this.send = function () 
			{
				this.xhr = new XMLHttpRequest();
				var mimeType;
				switch(this.request.dataType)
				{
					case "text":
					{
						mimeType = "text/plain";
						break;
					}

					case "xml":
					{
						mimeType = "application/xml";
						break;
					}

					case "html":
					{
						mimeType = "text/html";
						break;
					}

					case "json":
					{
						mimeType = "application/json";
						break;
					}
				}

				mimeType += " charset="+this.request.charset;
				if(this.xhr.overrideMimeType) this.xhr.overrideMimeType(mimeType);
				
				//Serializa os dados na URL
				if(this.request.data != null && this.request.type == 'GET') {
					this.request.url += ((/\?/).test(this.request.url) ? "&" : "?") + JRAW.urlEncode(this.request.data);
				}

				//Para não realizar cache adicionamos um timestamp
				if(!this.request.cache) this.request.url += ((/\?/).test(this.request.url) ? "&" : "?") + (new Date()).getTime();

				//Suporte para basic auth
				if(this.request.credentials) {
					this.xhr.open(this.request.type, this.request.url, this.request.async, this.request.credentials.user, this.request.credentials.password);
				} else {
					this.xhr.open(this.request.type, this.request.url, this.request.async);
				}

				//Nem sei se adianta de algo
				if(this.request.cors) {
					this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
					this.xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
				}

				if(this.request.data != null) {
					if(this.request.type == 'POST') {
						this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
						this.xhr.send(JRAW.urlEncode(this.request.data));
					} else if(this.request.type == 'GET') {
						this.xhr.send();
					}
				} else {
					this.xhr.send();
				}

				if(this.request.async) {
					this.xhr.onreadystatechange = function() {
						if(self.xhr.readyState == 4) self.getResponse();
					}
				}
				else this.getResponse();
			};

			//Obtem a resposta da requisição HTTP
			this.getResponse = function() {
				var response = {
						readyState:this.xhr.readyState,
						status:this.xhr.status,
						data:(this.request.dataType == "xml") ? this.xhr.responseXML:this.xhr.responseText,
						header:this.xhr.getAllResponseHeaders()
					},
					statusCode = this.xhr.status.toString();
				if(statusCode.lastIndexOf("2",0) === 0 || statusCode.lastIndexOf("3",0) === 0) {
					this.request.success(response);
				} else this.request.fail(response);
				this.request.done(response);
			};

			//Inicializa a requisição
			this.init(request);
    	},
    	JRAW = function(selector) {
			return new JRAW.fn.factory(selector);
		};


	//Método global de JRAW para extender objetos ou a si mesmo
	JRAW.extend = function() {

		var newObj, name, copy, i = 1, target = arguments[0] || {};

		//Se tiver apenas 1 argumento então extender a si próprio
		if(arguments.length == 1) {
			target = this;
			i--;
		}

		//Loop para extender target
		for(i; i < arguments.length; i++) {
			newObj = arguments[i];

			//Apenas extende objetos
			if ( newObj != null && type(newObj) === "object" ) {

				//Loop para todos os atributos
				for ( name in newObj ) {
					copy = newObj[name];
					if(copy !== undefined) {
						target[name] = newObj[name];
					}
				}
			}
		}
		return target;
	};

	//Definição de métodos da instância para novos objetos JRAW. Copiamos protoype para fn
	JRAW.fn = JRAW.prototype = {

		//Método que gerencia executa callback quando a página está pronta
		ready: function(callback) {
	        if ( pageReady ) return;
	        pageReady = true;
	        if ( document.readyState === "complete" ) {
	            return setTimeout( JRAW.ready, 1);
	        }
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded.bind(callback), false );
			return this;
		},

		//Retorna um array simples dos elementos
		toArray: function() {
			return slice.call( this );
		},

		//Retorna um elemento do JRAW
		get: function(index) {
			if(this.length-1 >= index) {
				return this[index];
			} else {
				return null;
			}
		},

		//Navega por todos elementos de JRAW e executa um callback
		each: function(callback) {
			return JRAW.each(this, callback);
		},

		//Altera ou obtem um atributo do nó para cada objeto
		attr: function(name, value) {
			if(value !== undefined) {
				JRAW.each(this, function(){
					if(this.setAttribute) {
						this.setAttribute(name, value);
					}
				});
				return this;
			} else {
				if(this.length > 0 && this[0] && this[0].getAttribute) {
					return this[0].getAttribute(name);
				}
				return null;
			}
		},



		//Define ou obtem o valor de um objeto do tipo input
		val: function(value) {
			if(value) {
				return JRAW.each(this, function(){
					if(isNode(this) && this.tagName == "INPUT") {
						this.value = value;
					}
				});

			} else {
				if(this.length && isNode(this[0]) && this[0].tagName == "INPUT") {
					return this.get(0).value;
				}
			}
			return null;
		},

		//Adiciona o evento de click para todos os elementos
		click: function(callback) {
			return JRAW.each(this, function(){
				var self = this;
				if(isNode(this)) {
					this.addEventListener("click", function(event){
						callback.call(self, event);
					});
				}
			});
		},

		//Retorna uma nova coleção de objetos filhos encontrados com o seletor
		find: function(selector) {
			var newNodes = JRAW();
			if(type(selector) == "string") {
				JRAW.each(this, function(){
					if(isNode(this)) {
						var match = this.querySelectorAll(selector);
						if(match !== undefined && match.length > 0) {
							JRAW.addAll(newNodes, match);
						}
					}
				});
				return newNodes;		
			}
			return rootJRAW;
		},

		//Remove todos os elementos
		remove: function() {
			JRAW.each(this, function(){
				if(isNode(this)) {
					this.remove();
				}
			});
		},

		//Retorna um novo conjunto de JRAW com elementos clonados
		clone: function() {
			var newNodes = JRAW();
			JRAW.each(this, function(){
				if(isNode(this)) {
					JRAW.addAll(newNodes, [this.cloneNode(true)]);
				}
			});
			return newNodes;
		},

		//Adiciona uma classe nos elementos
		addClass: function(cls) {
			if(cls !== undefined && type(cls) == "string") {
				return JRAW.each(this, function(){
					if(this.classList) {
						this.classList.add(cls);
					} else if(this.getAttribute) {
						var curClass = this.getAttribute("class");
						if(curClass) {
							this.setAttribute("class", curClass+" "+cls);
						} else {
							this.setAttribute("class", " "+cls);
						}
					}
				});
			}
			return this;
		},

		//Obtem as dimensões com o positionamento do objeto em relação ao body
		getDimension: function() {
			if(isNode(this[0])) {
				var bodyRect = bodyJRAW.get(0).getBoundingClientRect(),
				    elemRect = this[0].getBoundingClientRect();
				    return {
				    	width: elemRect.width,
				    	height: elemRect.height,
				    	top: elemRect.top - bodyRect.top,
				    	left: elemRect.left - bodyRect.left
				    };
			}
			return null;			
		},

		//Obtem a posição de um elemento visível em relação ao body
		getPosition: function() {
			if(isNode(this[0])) {
				var bodyRect = bodyJRAW.get(0).getBoundingClientRect(),
				    elemRect = this[0].getBoundingClientRect();
				    return {
				    	top: elemRect.top - bodyRect.top,
				    	left: elemRect.left - bodyRect.left
				    };
			}
			return null;			
		},

		//Define uma posição para todos os elementos
		setPosition: function(position) {
			position.top = position.top + "px";
			position.left = position.left + "px";
			return JRAW.applyCss(this, position);
		},

		//Remove uma classe dos elementos
		removeClass: function(cls) {
			if(cls !== undefined && type(cls) == "string") {
				return JRAW.each(this, function(){
					if(this.classList) {
						this.classList.remove(cls);
					} else if(this.getAttribute) {
						var curClass = this.getAttribute("class");
						curClass.replace(/\s+/g,' ');
						var clsArr = curClass.split(" "), 
							clsArrCopy = clsArr;
						for (var i = 0; i < clsArrCopy.length; i++) {
							if(clsArrCopy[i] == cls) {
								clsArr.splice(i,1);
								break;
							}
						}
						this.setAttribute("class", clsArr.join(" "));
					}
				});
			}
			return this;			
		},

		//Obtém ou substitui o HTML de um elemento
		html: function(htmlValue) {
			if(htmlValue !== undefined) {
				htmlValue = arguments[0];
				return JRAW.each(this, function(){
					this.innerHTML = htmlValue;
				});
			} else {
				if(isNode(this[0])) {
					return this[0].innerHTML;
				}
				return null;
			}
		},

		//Adiciona um elemento no início
		prepend: function(el) {
			var elType = null;
			if(isNode(el)) elType = "node";
			else if(type(el) == "string") elType = "string";
			if(elType) {
				return JRAW.each(this, function(){
					if(elType == "string") {
						this.insertAdjacentHTML('afterbegin', el);
					} else {
						this.insertBefore(el, this.childNodes[0]);
					}
				});
			}
			return this;			
		},

		//Adiciona um elemento no fim
		append: function(el) {
			var elType = null;
			if(isNode(el)) elType = "node";
			else if(type(el) == "string") elType = "string";
			if(elType) {
				return JRAW.each(this, function(){
					if(elType == "string") {
						this.insertAdjacentHTML('beforeend', el);
					} else {
						this.appendChild(el);
					}
				});
			}
			return this;
		},

		//Esconde os elementos
		hide: function() {
			return JRAW.applyCss(this,{display:"none"});
		},

		//Mostra os elementos
		show: function(inline) {
			if(inline) return JRAW.applyCss(this,{display:"inline-block"});
			return JRAW.applyCss(this,{display:"block"});	
		},

		//Aplica CSS fade in. Time em ms
		fadeIn: function(time) {
			var self = this;
			time = time || 400;
			JRAW.applyCss(this, {
				opacity:0,
				transition:"opacity 0 ease-in-out"
			});
			setTimeout(function(){
				JRAW.applyCss(self, {opacity: 1, transition:"opacity "+time+"ms ease-in-out"});
			},500);
			return this;
		},

		//Aplica css fade out. Time em ms
		fadeOut: function(time) {
			var self = this;
			time = time || 400;
			JRAW.applyCss(this, {
				opacity:1,
			});
			setTimeout(function(){
				JRAW.applyCss(self, {opacity: 0, transition:"opacity "+time+"ms ease-in-out"});
			},50);
			return this;
		},

		//Aplica um objeto de regras de css
		css: function(rules) {
			return JRAW.applyCss(this, rules);
		},

		//Atribui um valor no html com um refência {{name}}
		bindValue: function(name, value) {
			var self = this;
			return JRAW.each(this.find("[data-bindName='"+name+"']"), function(){
				var replace = this.getAttribute("data-bindReplace");
				if(replace) {
					if(replace == "html") this.innerHTML = value;
					else this.setAttribute(replace, value);
				}
			});
		}

	};

	//Definição de atributos e métodos estáticos, ou seja, globais para JRAW
	JRAW.extend({

		//Certifica que o JRAW não seja executado prematuramente
		isReady: false,

		addAll: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
			first.length = i;
			return first;
		},

		//Serializa um objeto para URL Encode
		urlEncode: function(obj, prefix) {
			var str = [], p;
			for(p in obj) {
				if (obj.hasOwnProperty(p)) {
					var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
					str.push((v !== null && typeof v === "object") ?
					serialize(v, k) :
					encodeURIComponent(k) + "=" + encodeURIComponent(v));
				}
			}
			return str.join("&");
		},

		//Fabrica um array em results
		makeArray: function(arr, results) {
			var ret = results || [];
			if(ret.length == 0) return ret;
			if(type(arr) === "string") arr = [arr];
			return JRAW.addAll(ret, arr);
		},

		//Gera um novo elemento HTML
		newHTML: function (el) {
			try {
				return document.createElement(el);
			} catch(ex) {
				return null;
			}
		},

		//Aplica ao obj um objeto de regras do css
		applyCss: function(obj, css) {
			this.each(obj, function(){
				if(type(css) == "object") {
					JRAW.extend(this.style, css);
				}
			});
			return obj;
		},

		//Método para iterar com callback
		each: function(obj, callback) {
			var length, i = 0;
			length = obj.length;
			for ( ; i < length; i++ ) {
				if (callback.call(obj[i], i) === false) {
					break;
				}
			}
			return obj;
		},

		//Realiza um ajax já tratando o JSON
		getJSON: function(request) {
			var ajax = new Ajax(request);
			if(ajax.request != null) {
				var success = ajax.request.success, fail = ajax.request.fail;
				JRAW.extend(ajax.request, {
					dataType: 'json',
					async: true,
					success: function(response) {
						try{
							var jsonData = JSON.parse(response.data);
							success(jsonData);
						} catch(ex) {
							fail(response);
							console.error(ex);
						}
					},
					fail: function(response) {
						fail(response);
					}
				});
				ajax.send();
			}
			return this;
		},
    
    //Realiza um ajax já tratando o JSON
		getJSONPronto: function(request) {
			var ajax = new Ajax(request);
			if(ajax.request != null) {
				var success = ajax.request.success, fail = ajax.request.fail;
				JRAW.extend(ajax.request, {
					dataType: 'json',
					async: true,
					success: function(response) {
						try{
							//var jsonData = JSON.parse(response.data);
							success(response.data);
						} catch(ex) {
							fail(response);
							console.error(ex);
						}
					},
					fail: function(response) {
						fail(response);
					}
				});
				ajax.send();
			}
			return this;
		},

		//Realiza um ajax
		ajax: function(request) {
			var ajax = new Ajax(request);
			if(ajax.request != null) {
				ajax.send();
			}
			return this;
		}		

	});


	//JRAW raíz com document
	var rootJRAW;

	//Método principal para geração de novos objetos JRAW
	var factory = JRAW.fn.factory = function(selector, root) {

		//É possível definir um outro objeto root para o novo objeto JRAW
		root = root || rootJRAW;
		var objType = type(selector);
		this.length = 0;

		//Se não houver seletor retorna um objeto JRAW vazio
		if(!selector) return JRAW.makeArray([], this);

		//Seletor como string, ex: #meu-id
		if(objType === "string") {
			var match = document.querySelectorAll(selector);
			if(match !== undefined && match.length > 0) {
				this.length = match.length;

				//Na raíz de cada objeto JRAW estão os elementos encontrados
				for (var i = 0; i < match.length; i++) {
					this[i] = match[i];
				}
				return this;
			}
			return this;
		} 

		//Seletor como um objeto, ex: $(document.body)
		else if(isNode(selector)) {
			this[0] = selector;
			this.length = 1;
			return this;
		} 

		//Seletor como uma função, ex: $(function()). Se for uma função anônima então ready é executado
		else if(objType === "function") {
			return root.ready !== undefined ? root.ready(selector) : selector(JRAW);
		}

		//Retorna um objeto JRAW genérioco com todos os elementos do seletor
		return JRAW.makeArray(selector, this);
	};

	//Torna público todos os métodos de instância definidos em JRAW.fn
	factory.prototype = JRAW.fn;
	rootJRAW = JRAW(document);
	var bodyJRAW = JRAW(document.body);

	//Torna JRAW global
	global.JRAW = global.$ = JRAW;
});
