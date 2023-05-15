import "./style.css"

interface Lek {
   tab: [
      { x: number; y: number; color: string },
      { x: number; y: number; color: string }
   ]
   axis: string
}

interface Kwadrat {
   x: number
   y: number
   color: string
   state: string
}

interface Zakres {
   x: number
   y: number
}

class Game {
   main: HTMLElement
   pigulka!: Lek
   currTab: Kwadrat[] = []
   pigulkaInterval: any
   width: number = 8
   height: number = 16
   startX: number = 3
   startY: number = 0
   virusNum: number = 3

   constructor() {
      this.main = document.getElementById("main") as HTMLElement

      document.onkeydown = (e) => {
         if (e.key == "ArrowRight") {
            // sprawdzanie czy ruch jest możliwy
            if (
               this.pigulka.tab[0].x + 1 < this.width &&
               this.pigulka.tab[1].x + 1 < this.width &&
               this.currTab[
                  this.getIndexOf(this.pigulka.tab[0].x + 1, this.pigulka.tab[0].y)
               ].color == "white" &&
               this.currTab[
                  this.getIndexOf(this.pigulka.tab[1].x + 1, this.pigulka.tab[1].y)
               ].color == "white"
            ) {
               this.pigulka.tab[0].x += 1
               this.pigulka.tab[1].x += 1
               this.printer()
            } else {
               console.log("blokada z prawej strony!")
            }
         } else if (e.key == "ArrowLeft") {
            // sprawdzanie czy ruch jest możliwy
            if (
               this.pigulka.tab[0].x - 1 >= 0 &&
               this.pigulka.tab[1].x - 1 >= 0 &&
               this.currTab[
                  this.getIndexOf(this.pigulka.tab[0].x - 1, this.pigulka.tab[0].y)
               ].color == "white" &&
               this.currTab[
                  this.getIndexOf(this.pigulka.tab[1].x - 1, this.pigulka.tab[1].y)
               ].color == "white"
            ) {
               this.pigulka.tab[0].x -= 1
               this.pigulka.tab[1].x -= 1
               this.printer()
            } else {
               console.log("blokada z lewej strony!")
            }
         } else if (e.key == "ArrowUp") {
            if (this.pigulka.axis == "right") {
               if (this.rotate("down")) this.pigulka.axis = "down"
            } else if (this.pigulka.axis == "down") {
               if (this.rotate("left")) this.pigulka.axis = "left"
            } else if (this.pigulka.axis == "left") {
               if (this.rotate("up")) this.pigulka.axis = "up"
            } else if (this.pigulka.axis == "up") {
               if (this.rotate("right")) this.pigulka.axis = "right"
            }
         } else if (e.key == "ArrowDown") {
            if (this.isBelow()) {
               this.pigulka.tab[0].y += 1
               this.pigulka.tab[1].y += 1
               this.printer()
            }
         }
      }

      this.createBoard()
      this.createPill(this.startX, this.startY)
      this.printer()
   }

   printer() {
      for (let i = 0; i < this.currTab.length; i++) {
         let block = document.getElementById(
            this.currTab[i].x + "_" + this.currTab[i].y
         ) as HTMLElement
         block.style.backgroundColor = this.currTab[i].color
      }
      for (let i = 0; i < 2; i++) {
         let block = document.getElementById(
            this.pigulka.tab[i].x + "_" + this.pigulka.tab[i].y
         ) as HTMLElement
         block.style.backgroundColor = this.pigulka.tab[i].color
      }
   }

   createBoard() {
      for (let y = 0; y < this.height; y++) {
         for (let x = 0; x < this.width; x++) {
            let block = document.createElement("div")
            block.className = "block"
            block.id = x + "_" + y

            this.main.append(block)
            this.currTab.push({
               x: x,
               y: y,
               color: "white",
               state: "none",
            })
         }
      }

      let tempCount = 0

      while (tempCount < 3) {
         let x = Math.floor(Math.random() * this.width)
         let y = Math.floor(Math.random() * (this.height - 4)) + 4
         let color = this.numberToColor(Math.floor(Math.random() * 3))

         if (this.currTab[this.getIndexOf(x, y)].color == "white") {
            this.currTab[this.getIndexOf(x, y)].color = color
            tempCount++
         }
      }
   }

   createPill(x: number, y: number) {
      let rColor1 = this.numberToColor(Math.floor(Math.random() * 3))
      let rColor2 = this.numberToColor(Math.floor(Math.random() * 3))

      this.pigulka = {
         tab: [
            { x: x, y: y, color: rColor1 },
            { x: x + 1, y: y, color: rColor2 },
         ],
         axis: "right",
      }

      this.pigulkaInterval = setInterval(() => {
         if (this.isBelow()) {
            this.pigulka.tab[0].y += 1
            this.pigulka.tab[1].y += 1
            this.printer()
         }
         // upadek bloczka
         else {
            let index0 = this.getIndexOf(this.pigulka.tab[0].x, this.pigulka.tab[0].y)
            let index1 = this.getIndexOf(this.pigulka.tab[1].x, this.pigulka.tab[1].y)

            this.currTab[index0].color = this.pigulka.tab[0].color
            this.currTab[index1].color = this.pigulka.tab[1].color

            clearInterval(this.pigulkaInterval!)
            setTimeout(() => {
               this.createPill(this.startX, this.startY)
               this.deleteLines()
               this.printer()
            }, 100)
         }
      }, 500)
   }

   rotate(dir: string) {
      if (dir == "down") {
         let index = this.getIndexOf(this.pigulka.tab[0].x, this.pigulka.tab[0].y + 1)
         if (this.currTab[index].color == "white") {
            this.pigulka.tab[1].x = this.currTab[index].x
            this.pigulka.tab[1].y = this.currTab[index].y
            this.printer()
            return true
         }
      } else if (dir == "left") {
         let index = this.getIndexOf(this.pigulka.tab[0].x - 1, this.pigulka.tab[0].y)
         if (this.currTab[index].color == "white" && this.pigulka.tab[0].x != 0) {
            this.pigulka.tab[1].x = this.currTab[index].x
            this.pigulka.tab[1].y = this.currTab[index].y
            this.printer()
            return true
         }
      } else if (dir == "up") {
         let index = this.getIndexOf(this.pigulka.tab[0].x, this.pigulka.tab[0].y - 1)
         if (this.currTab[index].color == "white") {
            this.pigulka.tab[1].x = this.currTab[index].x
            this.pigulka.tab[1].y = this.currTab[index].y
            this.printer()
            return true
         }
      } else if (dir == "right") {
         let index = this.getIndexOf(this.pigulka.tab[0].x + 1, this.pigulka.tab[0].y)
         if (
            this.currTab[index].color == "white" &&
            this.pigulka.tab[0].x != this.width - 1
         ) {
            this.pigulka.tab[1].x = this.currTab[index].x
            this.pigulka.tab[1].y = this.currTab[index].y
            this.printer()
            return true
         }
      }
      return false
   }

   isBelow() {
      // Sprawdzanie czy oś i lek jest na dole
      if (
         this.pigulka.tab[0].y + 1 < this.height &&
         this.pigulka.tab[1].y + 1 < this.height
      ) {
         // sprawdzanie czy kolory bloków na dole są białe
         let x1 = this.pigulka.tab[0].x
         let y1 = this.pigulka.tab[0].y

         let x2 = this.pigulka.tab[1].x
         let y2 = this.pigulka.tab[1].y

         if (
            (this.pigulka.axis == "right" &&
               this.currTab[this.getIndexOf(x1, y1 + 1)].color == "white" &&
               this.currTab[this.getIndexOf(x2, y2 + 1)].color == "white") ||
            (this.pigulka.axis == "down" &&
               this.currTab[this.getIndexOf(x2, y2 + 1)].color == "white") ||
            (this.pigulka.axis == "left" &&
               this.currTab[this.getIndexOf(x1, y1 + 1)].color == "white" &&
               this.currTab[this.getIndexOf(x2, y2 + 1)].color == "white") ||
            (this.pigulka.axis == "up" &&
               this.currTab[this.getIndexOf(x1, y1 + 1)].color == "white")
         ) {
            return true
         }
      }
      return false
   }

   getIndexOf(x: number, y: number) {
      return y * this.width + x
   }

   numberToColor(num: number): string {
      if (num == 0) return "red"
      if (num == 1) return "blue"
      if (num == 2) return "yellow"

      console.log("OUT OF BOUNDS (this.numberToColor)")
      return "outOfBounds"
   }

   deleteLines() {
      let marked = [] as Zakres[]

      // poziome linie
      for (let y = 0; y < this.height; y++) {
         let prevColor, currColor: string
         let count = 1

         for (let x = 1; x < this.width; x++) {
            prevColor = this.currTab[this.getIndexOf(x - 1, y)].color
            currColor = this.currTab[this.getIndexOf(x, y)].color

            if (prevColor == currColor && currColor != "white") count++
            else if (prevColor != currColor) {
               if (count > 3) {
                  for (let i = 0; i < count; i++) {
                     marked.push({ x: x - count + i, y: y })
                  }
               }
               count = 1
            }

            if (x == this.width - 1) {
               if (count > 3) {
                  for (let i = 0; i < count; i++) {
                     marked.push({ x: x - count + 1 + i, y: y })
                  }
               }
               count = 1
            }
         }
      }

      // pionowe linie
      for (let x = 0; x < this.width; x++) {
         let prevColor, currColor: string
         let count = 1

         for (let y = 1; y < this.height; y++) {
            prevColor = this.currTab[this.getIndexOf(x, y - 1)].color
            currColor = this.currTab[this.getIndexOf(x, y)].color

            if (prevColor == currColor && currColor != "white") count++
            else if (prevColor != currColor) {
               if (count > 3) {
                  for (let i = 0; i < count; i++) {
                     marked.push({ x: x, y: y - count + i })
                  }
               }
               count = 1
            }
            if (y == this.height - 1) {
               if (count > 3) {
                  for (let i = 0; i < count; i++) {
                     marked.push({ x: x, y: y - count + i + 1 })
                  }
               }
               count = 1
            }
         }
      }

      if (marked.length != 0) {
         marked.forEach((item) => {
            this.currTab[this.getIndexOf(item.x, item.y)].color = "white"
         })

         marked.forEach((item) => {
            this.recFall(item)
         })
      }
   }

   recFall(item: Zakres) {
      let abowe = this.currTab[this.getIndexOf(item.x, item.y - 1)].color

      if (abowe != "white" && item.y > 1) {
         this.currTab[this.getIndexOf(item.x, item.y)].color = abowe
         this.recFall(this.currTab[this.getIndexOf(item.x, item.y - 1)])
      } else {
         this.currTab[this.getIndexOf(item.x, item.y)].color = "white"
      }
   }
}

const game = new Game()
console.log(game.currTab)
