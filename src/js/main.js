(function(){


	var argv = require('nw.gui').App.argv;

	if(argv.length >= 2){

		var file1 = argv[0];
		var file2 = argv[1];

	}else{

		var file1 = './test/test1.txt';
		var file2 = './test/test2.txt';

	}

	var fs = require('fs');

	window.text1 = fs.readFileSync(file1,'utf8');
	window.text2 = fs.readFileSync(file2,'utf8');

	doDiff(text1,text2);

})();

// 同步滚动
$('#file1,#file2').on('scroll',function(e){

	var $this = $(this),
		$that = $('#file1,#file2').not($this);

	var thisHeight = $this.height(),
		thisWidth = $this.width(),
		thatHeight = $that.height(),
		thatWidth = $that.width();

	var heightPercent = $this.get(0).scrollTop / thisHeight,
		widthPercent = $this.get(0).scrollLeft /thisWidth;

	/*$that.get(0).scrollTop = heightPercent * thatHeight;
	$that.get(0).scrollLeft = widthPercent * thatWidth;*/
	$that.get(0).scrollTop = $this.get(0).scrollTop;
	$that.get(0).scrollLeft = $this.get(0).scrollLeft;

});


// prevent default behavior from changing page on dropped file
window.ondragover = function(e) { e.preventDefault(); return false };
window.ondrop = function(e) { e.preventDefault(); return false };

// 接受拖拽
$('#file1,#file2').on('dragover',function(){
	$(this).addClass('hover');
	return false;
}).on('dragend dragcancel',function(){
	$(this).removeClass('hover');
	return false;
}).on('drop',function(e){

	var files = e.dataTransfer.files,
		$this = $(this);

	if(files.length >= 2){
		$('#file1,#file2').empty();
	}

	$.each(files,function(index,file){

		var reader = new FileReader();

		reader.onload = function(e){

			if(files.length >= 2){

				window['text'+(index+1)] = e.target.result;

			}else{
				if($this.is('#file1')){
					window.text1 = e.target.result;
					$('#fileInfo1').text(file.name);
				}else{
					window.text2 = e.target.result;
					$('#fileInfo2').text(file.name);
				}
			}

			doDiff(text1,text2);


		}

		reader.readAsText(file,'utf8');

	});


	return false;
});


function doDiff(text1,text2){

	var lines1 = text1.split('\n');
	var lines2 = text2.split('\n');

	var editedLines1=[],editedLines2=[];

	var linesEditProgress = getEditProgress(lines1,lines2);

	linesEditProgress.forEach(function(progressItem){

		switch(progressItem.type){

			case 'copy':

				editedLines1[progressItem.position1]={
					class:"copy",
					text:progressItem.target1
				};
				editedLines2[progressItem.position2]={
					class:"copy",
					text:progressItem.target2
				};

				break;

			case 'replace':

				editedLines1[progressItem.position1]={
					class:"replace",
					text:progressItem.target1
				};
				editedLines2[progressItem.position2]={
					class:"replace",
					text:progressItem.target2
				};

				break;

			case 'delete':

				editedLines1[progressItem.position1]={
					class:"delete",
					text:progressItem.target1
				};
				

				break;

			case 'insert':

				editedLines2[progressItem.position2]={
					class:"insert",
					text:progressItem.target2
				};

				break;
		}

	});

	showFileContent(editedLines1,editedLines2);

}

function showFileContent(file1,file2){

	if(typeof file1 === 'string'){
		file1 = file1.splie('\n');
	}
	if(typeof file2 === 'string'){
		file2 = file2.splie('\n');
	}

	if(file1){

		$('#file1').html(file1.map(mapStyledLines).join(''));

	}

	if(file2){

		$('#file2').html(file2.map(mapStyledLines).join(''));
		
	}

	function mapStyledLines(editedLine){

		if(typeof editedLine === 'object'){
			return '<li class="' + editedLine.class + '"><span>' + editedLine.text.replace(/</g,'&lt;').replace(/ /g,'&nbsp;').replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;') + '</span></li>';
		}else{
			return editedLine;
		}

	}
}


function log(msg){

	if(typeof msg === 'object'){
		msg = JSON.stringify(msg);
	}

	$('#debug').append(msg.replace(/\n/g,'<br />') + '<br />');

}



