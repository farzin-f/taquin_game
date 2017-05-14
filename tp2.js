var divImage, urlImage, rows, cols, ordreInit, ordreShuffle, remplacement, affichageNum;

$(document).ready(function(){
                /* on(): pour attacher un evenement à tous les descendants d'un élément
                 * ainsi que pour "bubble-up" un evenement jusqu'au élément "body"
                 * http://api.jquery.com/on/
                 */
                $("#image").on('click', 'td', function () {
                    var cellId = Number($(this).attr('id'));
                    swapSeq(cellId);
                });
                
                updateScore(0);
        });
        
        
//http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
$(document).keydown(function(e) {
    var cellGrise = Number($('.grise').attr('id'));
    var cellId;
    switch(e.which) {
        case 37: // left
            cellId = cellGrise + 1;
            swapSeq(cellId);            
        break;

        case 38: // up            
            cellId = cellGrise + 5;
            swapSeq(cellId);
        break;

        case 39: // right            
            cellId = cellGrise - 1;
            swapSeq(cellId); 
        break;

        case 40: // down           
            cellId = cellGrise - 5;
            swapSeq(cellId);
        break;

        default: return; // sortire le handler pour les autres clés
    }
    e.preventDefault(); // empêcher l'action par défaut des flèches
});
        
//Remplacement de la case cliquée et la case grise (swaper une cellule ou une séquence de cellules)
function swapSeq(cellId){
   var cellGriseId = Number($('.grise').attr('id'));
   var sameRow = getRow(cellGriseId) == getRow(cellId);
   var sameCol = getCol(cellGriseId) == getCol(cellId);
   
   //Déplacements invalides
   if ((cellGriseId == cellId) || (!sameRow && !sameCol) || (cellId < 0) || (cellId > (rows*cols-1)))
        return null;
   
   //Case cliquée sur la même ligne ou colonne que la case grise
   else {
       
       var step = sameRow? 1 : cols; //Différence d'index entre les deux cases
       var dir = (cellId - cellGriseId)/Math.abs(cellId - cellGriseId); //Direction de déplacement de la case grise (-1 = Haut/Gauche)
       
       while (cellGriseId != cellId) {
           //Cellule voisine de la cellule grise
           var cellVoisineId = cellGriseId+(dir*step);
           
           //Récupérer cellules dans le DOM
           var cellGrise = $('#'+cellGriseId);
           var cellVoisine = $('#'+cellVoisineId);
           
           //Sauvegarder les attributs css
           var attrGris = cellGrise.css(["background-image", "background-position"]);

           var attrVoisine = cellVoisine.css(["background-image", "background-position"]);
           var numVoisine = cellVoisine.text();
           
           //Échanger attributs des deux cells
           cellGrise.removeClass("grise");
           cellGrise.css(attrVoisine);
           cellGrise.text(numVoisine);
           
           cellVoisine.addClass("grise");
           cellVoisine.css(attrGris);
           cellVoisine.text("");
           
           //Mettre à jour l'ordre des cases
           updateShuffleTab(cellVoisineId, cellGriseId);
           
           cellGriseId = cellVoisineId;
            
            updateScore(remplacement+1);
            
            
           //Tester fin de partie
            fin();
           
       }
   }
}

//Création du puzzle avec les pièces dans l'ordre (sur clic du bouton "Afficher l'image")
function createPuzzle(){
     divImage = $("div#image");     
     urlImage = $("input#url").val();
         
     rows = Number($("input#nb_rows").val());
     cols = Number($("input#nb_cols").val());
     
     ordreInit = range(rows*cols);
     ordreShuffle = ordreInit.slice(0);
     
     affichageNum = $("input#affNum").prop('checked');
     
     createTable(ordreInit);
}

//Mélanger l'ordre des pièces du puzzle (sur clic du bouton "Mélanger les tuiles")
function shufflePuzzle(){
    shuffleArray(ordreShuffle);
    createTable(ordreShuffle); 
}

//Créer la balise table avec les tuiles selon l'ordre passé en paramètre
function createTable(ordre) {
     divImage.empty(); // Remplace la table existante s'il y a lieu
     updateScore(0); //Reset le nombre de remplacements au besoin
           
     var table = $('<table/>').appendTo(divImage);
     //table.css("border", "1px solid");
     table.css("border", "ridge");
     
     //Ajuster à la fenêtre
     var w = $(window).width()*0.9;
     var h = $(window).height()*0.9;
     
     table.width(w);
     table.height(h);
    
     //idx itère sur ordre (représente ordre d'affichage des tuiles)
     var idx = 0;
     var lastIdx = (rows*cols)-1;
     
     //Générer la table et y insérer la bonne portion de l'image
     for (i = 0; i < rows; i++) {
     
         var row = $('<tr/>').appendTo(table);
         
         for (j = 0; j < cols; j++) {
         
             var cell = $('<td/>').appendTo(row);
             
             cell.attr("id",i*cols+j);
             cell.addClass("cell");
             cell.css("background-size", ""+w+"px "+h+"px");
             
             
             
             if(ordre[idx] == lastIdx){
                //Dernière cellule grise au départ
                cell.addClass("grise");
             } else {
             
                if (affichageNum) cell.text(ordre[idx]+1);
                
                //Découpage de l'image selon l'index de la tuile
                cell.css("background-image", "url("+urlImage+")");
                cell.css("background-position", ""+(getCol(ordre[idx],cols)/(cols-1))*100.0+"% "+
                                                   (getRow(ordre[idx],cols)/(rows-1))*100.0+"%");
             }
             idx++;
         }
     }
}

//Vérifier si l'ordre mélangé et équivalent de l'ordre initial
//et afficher le message de résultat
function fin(){
    //Tester si ordre des cases = ordre initial
    for (i = 0; i < rows*cols; i++) {
        if (ordreShuffle[i] != ordreInit[i])
            return false;
    }
    
    alert("Vous avez réussi avec " + remplacement + " remplacement"+ ((remplacement==1)? "!":"s!"));
    updateScore(0);
}


//Changer l'ordre des cellules dans le tableau mélangé 
function updateShuffleTab(cellId, cellGriseId){
    var temp = ordreShuffle[cellId];
    ordreShuffle[cellId] = ordreShuffle[cellGriseId];
    ordreShuffle[cellGriseId] = temp;
}

//Génère un tableau contenant les entiers de 0 à n-1
function range(n){
    var tab = [];
    for (i=0; i<n; i++){
        tab.push(i);
    }
    return tab;
}

//Algorithme adapté à partir de http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
//Mélange les entiers d'un array
function shuffleArray(tab) {
    for (var i = tab.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tab[i];
        tab[i] = tab[j];
        tab[j] = temp;
    }
}

//Retourne le numéro de la ligne sur laquelle se trouve idx
function getRow(idx) {
    return Math.floor(idx/cols);
}

//Retourne le numéro de la colonne sur laquelle se trouve idx
function getCol(idx) {
    return idx%cols;
}

function updateScore(score) {
    remplacement = score;
    $("span#scoreVal").text(remplacement);
}

