const HEROES = [
 ['Luzia','luzia',100,91,.46,20,'Facho','Um clarão que atravessa a roda de inimigos.'],
 ['Zambi','zambi',120,83,.65,32,'Ginga','Avança invulnerável e espalha fogo ao redor.'],
 ['Tião','tiao',87,101,.77,13,'Chuva de chumbo','Uma rajada em leque para abrir passagem.']
];
const BIOMES = [
 ['Mata do Avesso','mata','#182820','#0b1714','#6a9c66',['tree_a','tree_b','stump','mush_b','rock_m'],['d_tuft','d_flower','d_moss','d_reed'],'b_curupira','Curupira'],
 ['Sertão da Cinza','sertao','#38271d','#1c1419','#c38451',['cactus','cactus2','deadtree','rock_r','stump'],['d_dry','d_crack','d_bones','d_pebble'],'b_mula','Mula sem Cabeça'],
 ['Brejo da Cuca','cuca','#252036','#111222','#a48bbb',['twisted','mush_p','tomb','caldeirao','rock_m'],['d_skull','d_bones','d_flower2','d_moss'],'b_cuca','Cuca']
];
const FOES = {
 sombra:['Sombra',32,28,8,'hunt'], morcego:['Morcego',20,55,6,'weave'], fogo:['Fogo-fátuo',30,25,8,'shot'],
 queixada:['Queixada',52,31,12,'charge'], cupim:['Cupim',70,0,8,'nest'], cupinho:['Cupinho',15,63,5,'hunt'],
 coruja:['Coruja',37,37,9,'orbit'], caveira:['Caveira',45,27,9,'burst'], mapinguari:['Mapinguari',118,23,17,'slam'],
 visagem:['Visagem',39,37,10,'phase'], lobo:['Lobo',52,59,11,'pounce']
};
const PATRONS = [
 ['Saci','i_saci',[
 ['Redemoinho','Projéteis 22% mais rápidos.','bullet',.22],['Pé ligeiro','Velocidade de movimento +12%.','speed',.12],
 ['Carapuça','Recarga da esquiva 18% menor.','dash',.18],['Travessura','A cada quarto disparo, solte outro projétil.','echo',1],
 ['Fumaça viva','Esquivar solta um clarão que fere inimigos.','dashBlast',18],['Assobio','Ataque 13% mais depressa.','rate',.13]]],
 ['Iara','i_iara',[
 ['Água funda','Capacidade da lanterna +18.','max',18],['Canto das águas','Brasas atraídas a uma distância maior.','magnet',28],
 ['Correnteza','Projéteis desaceleram quem atingem.','slow',.25],['Rio cheio','Recupere 9 de chama ao limpar uma sala.','clear',9],
 ['Espelho d’água','Evite 12% dos golpes recebidos.','evade',.12]]],
 ['Curupira','i_curupira',[
 ['Casca grossa','Dano recebido reduzido em 13%.','armor',.13],['Raiz viva','Dano básico +6.','damage',6],
 ['Mata fechada','Golpes críticos empurram mais longe.','knock',48],['Pé virado','A esquiva dura um pouco mais.','dashTime',.10],['Seiva','Recupere 3 de chama por inimigo abatido.','kill',3]]],
 ['Boitatá','i_boitata',[
 ['Rastro de fogo','Disparos atravessam mais um inimigo.','pierce',1],['Olho em brasa','Chance de crítico +15%.','crit',.15],
 ['Fornalha','A habilidade causa +22 de dano.','power',22],['Brasido','Reduza em 18% o consumo de chama.','drain',.18],
 ['Labareda','Inimigos derrotados causam uma explosão.','blast',17],['Faísca antiga','Recarga da habilidade 19% menor.','cool',.19]]],
 ['Boto','i_boto',[
 ['Festa no rio','Ganhe três moedas extras por sala.','gold',3],['Chapéu branco','A primeira pancada em cada sala é absorvida.','guard',1],
 ['Moda de feira','Compre com 25% de desconto.','discount',.25],['Cortesia','Toda brasa recolhida restaura +2 de chama.','ember',2],
 ['Sorte da margem','Uma moeda a mais por inimigo abatido.','coins',1]]],
 ['Cuca','i_cuca',[
 ['Sono leve','Habilidade desacelera todos à volta.','drowse',1],['Olho da noite','Críticos causam mais 40% de dano básico.','critPower',.40],
 ['Feitiço preso','Elites e chefes recebem +18% de dano.','boss',.18],['Colheita escura','Receba uma cinza extra por sala.','ash',1]]]
].flatMap(([patron,icon,entries])=>entries.map(([name,desc,key,value])=>({patron,icon,name,desc,key,value})));
const PACTS=[
 ['Pavio proibido','+15 de dano e +30% de consumo.','damage',15,'drain',-.30],
 ['Fome da Cuca','+50% de cadência e −22 de capacidade.','rate',.50,'max',-22],
 ['Corpo de barro','−30% de dano recebido e −17% de movimento.','armor',.30,'speed',-.17],
 ['Segredo no caldeirão','+2 perfurações e −7 de dano básico.','pierce',2,'damage',-7]
];
const UPGRADES=[
 ['Vidro de lamparina','+8 de chama máxima','max',8],['Ferro de ofício','+2 de dano de ataque','damage',2],
 ['Passo de romeiro','+4% de movimento','speed',.04],['Pavio encerado','−5% de consumo','drain',.05],
 ['Amuleto de couro','−5% de dano recebido','armor',.05],['Milho no bolso','+5 moedas iniciais','startGold',5],
 ['Corda de fumo','−7% na recarga da habilidade','cool',.07],['Concha de rio','+8 de alcance de coleta','magnet',8]
];
const POOLS=[['sombra','morcego','fogo','queixada','cupim','cupinho'],['queixada','coruja','caveira','mapinguari','morcego','cupinho'],['visagem','lobo','mapinguari','caveira','fogo','coruja']];
