<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Abraham\TwitterOAuth\TwitterOAuth;
use DB;
use App\Quotation;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Model;

class GastosController extends Controller
{
    private $twiiterApp = [
        'key' => 'dLDm9kp0I9raYSUhFraWugjA6',
        'secret' => 'UwaVvzZj1BoXNMmBEtebmDZwOfrBeNSUteA2bELHoM3oePl9to',
        'oauth_token' => '737760914825482240-gNw7HOp1tZJZniy83rtf8atzWJl8Ywn',
        'oauth_token_secret' => 'NvsvSzepJg0XuAocSa7O5tUamBXSufRqNg8wE73VNvjpx'
    ];

    //private $uf = ["ac","al","ap","ba","ce","df","es","go","ma","mt","ms","mg","pa","pb","pr","pe","pi","rj","rn","rs","ro","rr","sc","sp","se","to"];
    private $uf = ["es", "df"];

	public function go()
	{
		set_time_limit(60);
		echo "<pre>";
		$url = "https://servicos.goias.gov.br/ptg-api/rest/execorcamentarianaturezadespesa?ano=2017&mes=1";
		$header = ["accept: application/gov.go.ptg.service.entidade.v1.despesas.execorcamentarianaturezadespesa-v1+json", "content-type:*/*"];
		print_r($this->requestGastos($url, $this->createContext($header)));
	}

	public function df(Request $request)
	{
		$url = "http://www.transparencia.df.gov.br/api/despesa/consulta-dinamica?anoExercicio=2017&busy=true&colunas=%7B%22nomeUnidadeGestora%22:%7B%22nome%22:%22Unidade+Gestora%22,%22visible%22:true,%22disabled%22:true,%22termo%22:%22%C3%93rg%C3%A3os+e+Entidades+encarregadas+de+gerir+os+recursos+p%C3%BAblicos%22%7D,%22nomeGestao%22:%7B%22nome%22:%22Gest%C3%A3o%22,%22visible%22:false,%22termo%22:%22Unidade+respons%C3%A1vel+pela+administra%C3%A7%C3%A3o+dos+recursos+p%C3%BAblicos%22%7D,%22nomeProjeto%22:%7B%22nome%22:%22A%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Atividade+que+visa+a+obten%C3%A7%C3%A3o+de+bens+ou+servi%C3%A7os+para+alcan%C3%A7ar+o+objetivo+de+um+programa.%22%7D,%22nomeEsfera%22:%7B%22nome%22:%22Esfera%22,%22visible%22:false,%22termo%22:%22Indica+a+qual+or%C3%A7amento+a+despesa+faz+parte:+fiscal,+seguridade+social+ou+investimento+das+empresas+estatais%22%7D,%22nomeModalidadeLicitacao%22:%7B%22nome%22:%22Tipo+de+Despesa%22,%22visible%22:false,%22termo%22:%22Indica+o+procedimento+utilizado+para+realiza%C3%A7%C3%A3o+da+despesa%22%7D,%22nomeProgramaTrabalho%22:%7B%22nome%22:%22Programa+de+Trabalho%22,%22visible%22:false,%22termo%22:%22Conjunto+organizado+das+a%C3%A7%C3%B5es+que+ser%C3%A3o+executadas+de+acordo+com+as+possibilidades+financeiras+do+governo%22%7D,%22nomeFuncao%22:%7B%22nome%22:%22Fun%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22%C3%81rea+de+atua%C3%A7%C3%A3o+da+Administra%C3%A7%C3%A3o+P%C3%BAblica%22%7D,%22nomeSubfuncao%22:%7B%22nome%22:%22Subfun%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Identifica+a+natureza+b%C3%A1sica+das+a%C3%A7%C3%B5es+de+uma+determinada+%C3%A1rea+de+atua%C3%A7%C3%A3o%22%7D,%22nomePrograma%22:%7B%22nome%22:%22Programa%22,%22visible%22:false,%22termo%22:%22Instrumento+de+organiza%C3%A7%C3%A3o+da+atua%C3%A7%C3%A3o+governamental,+formado+por+um+conjunto+de+a%C3%A7%C3%B5es+que+buscam+atingir+objetivos+preestabelecidos.%22%7D,%22nomeSubtitulo%22:%7B%22nome%22:%22Subt%C3%ADtulo%22,%22visible%22:false,%22termo%22:%22Identifica+a+localiza%C3%A7%C3%A3o+f%C3%ADsica+ou+geogr%C3%A1fica+da+a%C3%A7%C3%A3o+or%C3%A7ament%C3%A1ria%22%7D,%22nomeCategoriaEconomica%22:%7B%22nome%22:%22Categoria+Econ%C3%B4mica%22,%22visible%22:false,%22termo%22:%22Classifica%C3%A7%C3%A3o+das+receitas+e+despesas+para+uma+avalia%C3%A7%C3%A3o+do+efeito+econ%C3%B4mico%22%7D,%22nomeGrupoNatureza%22:%7B%22nome%22:%22Grupo+de+Natureza+da+Despesa%22,%22visible%22:false,%22termo%22:%22Agrega+elementos+de+despesa+com+as+mesmas+caracter%C3%ADsticas+quanto+ao+objeto+do+gasto%22%7D,%22nomeModalidadeAplicacao%22:%7B%22nome%22:%22Modalidade+de+Aplica%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Indica+se+os+recursos+ser%C3%A3o+aplicados+diretamente+pelo+%C3%B3rg%C3%A3o+ou+sob+a+forma+de+transfer%C3%AAncia+a+outras+entidades+p%C3%BAblicas+ou+privadas%22%7D,%22nomeElemento%22:%7B%22nome%22:%22Elemento+de+Despesa%22,%22visible%22:false,%22termo%22:%22Indica+os+objetos+de+gastos%22%7D,%22nomeFonteRecurso%22:%7B%22nome%22:%22Fonte+de+Recursos%22,%22visible%22:false,%22termo%22:%22Indica+a+origem+dos+recursos+para+realizar+as+despesas%22%7D,%22numeroProcesso%22:%7B%22nome%22:%22N%C2%BA+do+Processo%22,%22visible%22:false,%22termo%22:%22N%C2%BA+do+processo+referente+%C3%A0+despesa%22%7D,%22valorNeFinal%22:%7B%22nome%22:%22Empenhado%22,%22visible%22:true,%22currency%22:true,%22link1%22:true,%22termo%22:%22Valor+reservado+para+pagamento+de+um+produto+ou+servi%C3%A7o%22%7D,%22valorNlBruto%22:%7B%22nome%22:%22Liquidado%22,%22visible%22:true,%22currency%22:true,%22link2%22:true,%22termo%22:%22Valor+que+o+%C3%B3rg%C3%A3o+deve+pagar+com+base+na+comprova%C3%A7%C3%A3o+do+produto+entregue+ou+servi%C3%A7o+realizado%22%7D,%22valorPagoExercicio%22:%7B%22nome%22:%22Pago+EX%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+despesas+do+exerc%C3%ADcio+corrente%22%7D,%22valorPagoRPP%22:%7B%22nome%22:%22Pago+RPP%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+restos+a+pagar+processados+(RPP),+ou+seja,+despesas+liquidadas+e+n%C3%A3o+pagas+no+exerc%C3%ADcio+anterior%22%7D,%22valorPagoRPNP%22:%7B%22nome%22:%22Pago+RPNP%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+restos+a+pagar+n%C3%A3o+processados+(RPNP),+ou+seja,+despesas+empenhadas+e+n%C3%A3o+liquidadas+no+exerc%C3%ADcio+anterior%22%7D,%22valorPagoRET%22:%7B%22nome%22:%22Pago+RET%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+das+reten%C3%A7%C3%B5es+(RET)+de+pagamento+de+tributos+federais,+estaduais+ou+municipais%22%7D,%22valorObFinal%22:%7B%22nome%22:%22+Total+Pago%22,%22visible%22:true,%22currency%22:true,%22link3%22:true,%22termo%22:%22Valor+total+pago+no+exerc%C3%ADcio+(desembolsado):+despesas+do+exerc%C3%ADcio,+restos+a+pagar+processados%2Fn%C3%A3o+processados+e+reten%C3%A7%C3%B5es%22%7D%7D&dataAtualizacao=2017-08-28T12:18:54.613Z&editing=true&page=0&size=100";

		$pg = $request->input("pg") ? : 1;
		$context = $this->createContext(["content-type:application/json"]);
		if($context) {
			$response = $this->requestGastos($url, $context);
			if($response) {
				$gastos = $this->paginateDf($response->content, $pg);
				return ($gastos) ? $gastos:"";
			}
		}
		return '';
	}

	public function es(Request $request)
	{
		$ano = $request->input("ano") ? : "2017";
		$pg = $request->input("pg") ? : 1;
		$url = "https://transparencia.es.gov.br/Api/Despesa/ListarOrgaos?ano=$ano&numeroPagina=1";
		$context = $this->createContext(["content-type:application/json"]);
		if($context) {
			$response = $this->requestGastos($url, $context);
			if($response) {
				$gastos = $this->paginateEs($response->Orgaos, $pg, $ano);
				return ($gastos) ? $gastos:"";
			}
		}
		return '';
	}
  
  //recebe o GET do javascript e faz a requisição no banco com o estado e mes selecionado
  //retorna um json com os dados
  public function dados(Request $request)
	{
		$mes = $request->input("data") ? : "01";
    $estado = $request->input("estado") ? : "ba";
    //var_dump($mes);
    $gastos = DB::table('DADOS')
    ->where('UF', $estado)
    ->whereMonth('DATADESP', '=', (int)$mes)
    ->where('VALORPAG','<>',0)
    ->get();
      
     
    //$gastos = DB::select('select * from UNIDADEGESTORA where UF = ?', $estado)->first();
    return (json_encode($gastos)) ? $gastos:"";
  }

	public function randomTweet(Request $request)
	{
		$randomKey = rand(0, 1);
		$ufRandom = $this->uf[$randomKey];
		$ano = $request->input("ano") ? : "2017";
		$pg = $request->input("pg") ? : 1;
		if($ufRandom == "df") {

			$url = "http://www.transparencia.df.gov.br/api/despesa/consulta-dinamica?anoExercicio=2017&busy=true&colunas=%7B%22nomeUnidadeGestora%22:%7B%22nome%22:%22Unidade+Gestora%22,%22visible%22:true,%22disabled%22:true,%22termo%22:%22%C3%93rg%C3%A3os+e+Entidades+encarregadas+de+gerir+os+recursos+p%C3%BAblicos%22%7D,%22nomeGestao%22:%7B%22nome%22:%22Gest%C3%A3o%22,%22visible%22:false,%22termo%22:%22Unidade+respons%C3%A1vel+pela+administra%C3%A7%C3%A3o+dos+recursos+p%C3%BAblicos%22%7D,%22nomeProjeto%22:%7B%22nome%22:%22A%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Atividade+que+visa+a+obten%C3%A7%C3%A3o+de+bens+ou+servi%C3%A7os+para+alcan%C3%A7ar+o+objetivo+de+um+programa.%22%7D,%22nomeEsfera%22:%7B%22nome%22:%22Esfera%22,%22visible%22:false,%22termo%22:%22Indica+a+qual+or%C3%A7amento+a+despesa+faz+parte:+fiscal,+seguridade+social+ou+investimento+das+empresas+estatais%22%7D,%22nomeModalidadeLicitacao%22:%7B%22nome%22:%22Tipo+de+Despesa%22,%22visible%22:false,%22termo%22:%22Indica+o+procedimento+utilizado+para+realiza%C3%A7%C3%A3o+da+despesa%22%7D,%22nomeProgramaTrabalho%22:%7B%22nome%22:%22Programa+de+Trabalho%22,%22visible%22:false,%22termo%22:%22Conjunto+organizado+das+a%C3%A7%C3%B5es+que+ser%C3%A3o+executadas+de+acordo+com+as+possibilidades+financeiras+do+governo%22%7D,%22nomeFuncao%22:%7B%22nome%22:%22Fun%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22%C3%81rea+de+atua%C3%A7%C3%A3o+da+Administra%C3%A7%C3%A3o+P%C3%BAblica%22%7D,%22nomeSubfuncao%22:%7B%22nome%22:%22Subfun%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Identifica+a+natureza+b%C3%A1sica+das+a%C3%A7%C3%B5es+de+uma+determinada+%C3%A1rea+de+atua%C3%A7%C3%A3o%22%7D,%22nomePrograma%22:%7B%22nome%22:%22Programa%22,%22visible%22:false,%22termo%22:%22Instrumento+de+organiza%C3%A7%C3%A3o+da+atua%C3%A7%C3%A3o+governamental,+formado+por+um+conjunto+de+a%C3%A7%C3%B5es+que+buscam+atingir+objetivos+preestabelecidos.%22%7D,%22nomeSubtitulo%22:%7B%22nome%22:%22Subt%C3%ADtulo%22,%22visible%22:false,%22termo%22:%22Identifica+a+localiza%C3%A7%C3%A3o+f%C3%ADsica+ou+geogr%C3%A1fica+da+a%C3%A7%C3%A3o+or%C3%A7ament%C3%A1ria%22%7D,%22nomeCategoriaEconomica%22:%7B%22nome%22:%22Categoria+Econ%C3%B4mica%22,%22visible%22:false,%22termo%22:%22Classifica%C3%A7%C3%A3o+das+receitas+e+despesas+para+uma+avalia%C3%A7%C3%A3o+do+efeito+econ%C3%B4mico%22%7D,%22nomeGrupoNatureza%22:%7B%22nome%22:%22Grupo+de+Natureza+da+Despesa%22,%22visible%22:false,%22termo%22:%22Agrega+elementos+de+despesa+com+as+mesmas+caracter%C3%ADsticas+quanto+ao+objeto+do+gasto%22%7D,%22nomeModalidadeAplicacao%22:%7B%22nome%22:%22Modalidade+de+Aplica%C3%A7%C3%A3o%22,%22visible%22:false,%22termo%22:%22Indica+se+os+recursos+ser%C3%A3o+aplicados+diretamente+pelo+%C3%B3rg%C3%A3o+ou+sob+a+forma+de+transfer%C3%AAncia+a+outras+entidades+p%C3%BAblicas+ou+privadas%22%7D,%22nomeElemento%22:%7B%22nome%22:%22Elemento+de+Despesa%22,%22visible%22:false,%22termo%22:%22Indica+os+objetos+de+gastos%22%7D,%22nomeFonteRecurso%22:%7B%22nome%22:%22Fonte+de+Recursos%22,%22visible%22:false,%22termo%22:%22Indica+a+origem+dos+recursos+para+realizar+as+despesas%22%7D,%22numeroProcesso%22:%7B%22nome%22:%22N%C2%BA+do+Processo%22,%22visible%22:false,%22termo%22:%22N%C2%BA+do+processo+referente+%C3%A0+despesa%22%7D,%22valorNeFinal%22:%7B%22nome%22:%22Empenhado%22,%22visible%22:true,%22currency%22:true,%22link1%22:true,%22termo%22:%22Valor+reservado+para+pagamento+de+um+produto+ou+servi%C3%A7o%22%7D,%22valorNlBruto%22:%7B%22nome%22:%22Liquidado%22,%22visible%22:true,%22currency%22:true,%22link2%22:true,%22termo%22:%22Valor+que+o+%C3%B3rg%C3%A3o+deve+pagar+com+base+na+comprova%C3%A7%C3%A3o+do+produto+entregue+ou+servi%C3%A7o+realizado%22%7D,%22valorPagoExercicio%22:%7B%22nome%22:%22Pago+EX%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+despesas+do+exerc%C3%ADcio+corrente%22%7D,%22valorPagoRPP%22:%7B%22nome%22:%22Pago+RPP%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+restos+a+pagar+processados+(RPP),+ou+seja,+despesas+liquidadas+e+n%C3%A3o+pagas+no+exerc%C3%ADcio+anterior%22%7D,%22valorPagoRPNP%22:%7B%22nome%22:%22Pago+RPNP%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+pago+de+restos+a+pagar+n%C3%A3o+processados+(RPNP),+ou+seja,+despesas+empenhadas+e+n%C3%A3o+liquidadas+no+exerc%C3%ADcio+anterior%22%7D,%22valorPagoRET%22:%7B%22nome%22:%22Pago+RET%22,%22visible%22:false,%22currency%22:true,%22termo%22:%22Valor+das+reten%C3%A7%C3%B5es+(RET)+de+pagamento+de+tributos+federais,+estaduais+ou+municipais%22%7D,%22valorObFinal%22:%7B%22nome%22:%22+Total+Pago%22,%22visible%22:true,%22currency%22:true,%22link3%22:true,%22termo%22:%22Valor+total+pago+no+exerc%C3%ADcio+(desembolsado):+despesas+do+exerc%C3%ADcio,+restos+a+pagar+processados%2Fn%C3%A3o+processados+e+reten%C3%A7%C3%B5es%22%7D%7D&dataAtualizacao=2017-08-28T12:18:54.613Z&editing=true&page=0&size=100";
			
			$context = $this->createContext(["content-type:application/json"]);
			if($context) {
				$response = $this->requestGastos($url, $context);
				if($response) {
					$tweet = $this->getTweet($this->getRandomOrgaoDf($response->content));
					$tweet["uf"] = $ufRandom;
					return json_encode($tweet);
				}
			}	
		} else {
			$url = "https://transparencia.es.gov.br/Api/Despesa/ListarOrgaos?ano=$ano&numeroPagina=1";
			$context = $this->createContext(["content-type:application/json"]);
			if($context) {
				$response = $this->requestGastos($url, $context);
				if($response) {
					$tweet = $this->getTweet($this->getRandomOrgaoEs($response->Orgaos));
					$tweet["uf"] = $ufRandom;
					return json_encode($tweet);
				}
			}
		}	
		return '{}';	
	}

	private function getRandomOrgaoDf($gastos)
	{
		$total = count($gastos);
		$randomKey = rand(0, $total-1);
		return $gastos[$randomKey]->nomeUnidadeGestora ? : "";		
	}

	private function getRandomOrgaoEs($gastos)
	{
		$total = count($gastos);
		$randomKey = rand(0, $total-1);
		return $gastos[$randomKey]->strNomeUnidadeGestora ? : "";
	}

    private function getTweet($term)
    {
    	if($term) {
	        $tweet = $this->searchTwitter($term);
	        return ($tweet) ? $tweet:"{}";
    	}
    	return "{}";
    }

    private function searchTwitter($term)
    {    	
    	$tweet["term"] = $term;
        try {
            $conn = new TwitterOAuth($this->twiiterApp["key"], $this->twiiterApp["secret"], $this->twiiterApp["oauth_token"], $this->twiiterApp["oauth_token_secret"]);
            $params = ['q' => $term,
                'count' => 1,
                'tweet_mode'=>'extended',
                'result_type'=>'mixed recent popular',
                'locale' => 'pt'
            ];
            if($conn) {
                $response = $conn->get('search/tweets', $params);
                if($response && count($response->statuses) > 0) {
                    $tweet["text"] = $response->statuses[0]->full_text;
                    $tweet["user"] = "@".$response->statuses[0]->user->name;
                }
            }
            return $tweet;
        } catch(Exception $e) {
        	return $tweet;
        }  
    }

	private function paginateEs($gastos, $pg, $ano)
	{
		$gastosNew = [];
		$total = count($gastos);
		$totalPg = ceil($total/10);
		if($pg <= $totalPg) {
			$gastosNew["total"] = $total;
			$gastosNew["ano"] = $ano;
			$gastosNew["totalPg"] = $totalPg;
			$gastosNew["curPg"] = intval($pg);
			$offset = ($pg-1)*10;
			$length = 10;
			$orgaos = array_slice($gastos, $offset, $length, true);
			$gastosNew["gastos"] = [];

			foreach ($orgaos as $key => $value) {
				$gastosNew["gastos"][] = [
					"orgao"=>$value->strNomeUnidadeGestora,
					"empenhado"=>number_format($value->total_emp, 2, ',', '.'),
					"liquido"=>number_format($value->total_liq, 2, ',', '.'),
					"pago"=>number_format($value->total_pg, 2, ',', '.')
				];
			}

			return json_encode($gastosNew);
		}
		return null;
	}

	public function paginateDf($gastos, $pg)
	{
		$gastosNew = [];
		$total = count($gastos);
		$totalPg = ceil($total/10);
		if($pg <= $totalPg) {
			$gastosNew["total"] = $total;
			$gastosNew["totalPg"] = $totalPg;
			$gastosNew["curPg"] = intval($pg);
			$offset = ($pg-1)*10;
			$length = 10;
			$orgaos = array_slice($gastos, $offset, $length, true);
			$gastosNew["gastos"] = [];
			foreach ($orgaos as $key => $value) {
				$gastosNew["gastos"][] = [
					"orgao"=>$value->nomeUnidadeGestora,
					"empenhado"=>number_format($value->valorNeFinal, 2, ',', '.'),
					"liquido"=>number_format($value->valorNlBruto, 2, ',', '.'),
					"pago"=>number_format($value->valorObFinal, 2, ',', '.')
				];
			}
			return json_encode($gastosNew);
		}
		return null;	
	}

	private function requestGastos($url,$context)
	{
		try {
			$result = file_get_contents($url,false,$context);
			if($result) return json_decode($result);
			return null;
		} catch(Exception $e) {
			return null;
		}
	}

	private function createContext($headers)
	{
		$opts = ['http'=>['method'=>'GET', 'header'=>'']];
		foreach ($headers as $key => $value) {
			$opts["http"]['header'] .= $value."\r\n";
		}
		try {
			return stream_context_create($opts);
		} catch(Exception $e) {
			return null;
		}
	}

}