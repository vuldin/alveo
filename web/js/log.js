/**@license
 * alveo <https://github.com/joshuapurcell/alveo>
 * Copyright (C) 2013 Joshua Purcell <joshua.purcell@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
$(function(){
  if(!navigator.userAgent.match(/(Nintendo WiiU)/)){
    $('#consoleWrapper').css('display','none');
  }
});
function log(text){
  if(navigator.userAgent.match(/(Nintendo WiiU)/)){
    jQuery('<div/>',{
      //id:'consoleDiv',
      text:text
    }).addClass('consoleText').appendTo($('#console'));
    fitConsoleOutput();
  }else{
    console.log(text);
  }
}
function fitConsoleOutput(){
  if($('#console').children().height()*$('#console').children().length>$(window).height()-20){
    $('#console').children().first().empty();
    $('#console').children().first().remove();
    fitConsoleOutput();
  }
}