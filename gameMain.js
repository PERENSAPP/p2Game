const scoreElement = document.querySelector('#scoreElement')
const canvas = document.querySelector('canvas')
const c = canvas.getContext("2d")
// pas hier de game height en width aan
canvas.width = innerWidth
canvas.height = innerHeight

// Constructor met Player informatie + draw + update fuctie voor de animatie
class Player {
    constructor() {
        this.speed = {
            x: 0,
            y: 0
        }
        this.rotation = 0
        this.opacity = 1
        const image = new Image()
        image.src = './img/SS.png'
        image.onload = () => {
            const scale = 0.225
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            // x: = horizontaal plaatsing voor de player
            // y: = verticale plaatsing voor de player deze staat vast  
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }
    // In de draw zitten ook rotate functies
    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        )
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        c.restore()
    }
    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.speed.x
        }
    }
}
// Constructor met informatie voor de projectiles + draw + 
class Projectile {
    constructor({ position, speed }) {
        this.position = position
        this.speed = speed
        this.radius = 3
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = '#ADD8E6' // GROEN=#00FF00 
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.speed.x
        this.position.y += this.speed.y
    }
}
class Particle {
    constructor({ position, speed, radius, color, fades }) {
        this.position = position
        this.speed = speed

        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades = fades
    }
    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }
    update() {
        this.draw()
        this.position.x += this.speed.x
        this.position.y += this.speed.y

        if (this.fades)
            this.opacity -= 0.01
    }
}
// Constructor met informatie voor de invader projectiles + draw + 
class InvaderProjectile {
    constructor({ position, speed }) {
        this.position = position
        this.speed = speed
        this.width = 3
        this.height = 20
    }
    draw() {
        c.fillStyle = "#CB4335"
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        this.position.x += this.speed.x
        this.position.y += this.speed.y
    }
}
// constructor met Informatie voor 1 individuele invader + draw + 
class Invader {
    constructor({ position }) {
        this.speed = {
            x: 0,
            y: 0
        }
        const image = new Image()
        image.src = './img/Invader.png'
        image.onload = () => {
            const scale = 0.090
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
    update({ speed }) {
        if (this.image) {
            this.draw()
            this.position.x += speed.x
            this.position.y += speed.y
        }
    }
    shoot(invaderProjectiles) {
        invaderProjectiles.push(
            new InvaderProjectile({
                position: {
                    x: this.position.x + this.width / 2,
                    y: this.position.y + this.height
                },
                speed: {
                    x: 0,
                    y: 5
                }
            })
        )
    }
}
// constructor met informatie voor meer Invaders van de class Invader
class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.speed = {
            x: 3,
            y: 0
        }

        this.invaders = []

        const horizontaleRijen = Math.ceil(Math.random() * 5 + 1)
        const induvidualInvader = Math.ceil(Math.random() * 10 + 1)
        // this.width is voor het links en naar rechts bouncen van de grid pas de value aan voor een de gewenste width
        this.width = induvidualInvader * 60
        for (let x = 0; x < induvidualInvader; x++) {
            for (let y = 0; y < horizontaleRijen; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * 55,
                        y: y * 40
                    }
                }))
            }
        }
        console.log(this.invaders)
    }
    update() {
        this.position.x += this.speed.x
        this.position.y += this.speed.y

        this.speed.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.speed.x = -this.speed.x
            this.speed.y = 30
        }
    }
}

const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomSpawnInterval = Math.ceil(Math.random() * 1000) + 500
let game = { over: false, active: true }
let score = 0

for (let i = 0; i < 100; i++) {
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        // snelheid van de sterren aanpassen door de waarden van y te veranderen naar de gewenste snelheid
        speed: {
            x: 0,
            y: 0.5
        },
        radius: Math.random() * 4,
        color: 'white' // Ster kleur aan passen  
    }))
}

// player en invader particles
function createParticles({ object, color }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            speed: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3
            },
            radius: Math.random() * 4,
            color: color || 'red', // paricles kleur aan passen HIER #3B3B3B grijs
            fades: true
        }))
    }
}

// Hiermee voer je alles uit en wordt dan weergeven op je beeld
function animate() {
    if (!game.active) return
    //standaard canvas acher grond
    requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    // dit laat de speler zien
    player.update()
    // Particles weergeven en verwijderen na een paar sec
    particles.forEach((particle, i) => {

        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0)
        } else {
            particle.update()
        }
    })

    // invader projectiles weergeven en verwijderen zodra het van scherm is (HEEL vervelend - Evan)
    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.
            height >= canvas.height) {
            {
                setTimeout(() => {
                    invaderProjectiles.splice(index, 1)
                }, 0)
            }
        } else invaderProjectile.update()
        // hit detection voor de player. De player kan geraakt worden door ( speler explodeerd) de invaders + particles fuction 
        if (
            invaderProjectile.position.y + invaderProjectile.height
            >=
            player.position.y && invaderProjectile.position.x +
            invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x +
            player.width
        ) { // Game over console.log test 
            // console.log("Je bent geraakt")
            // time out lose condition en verwijdering van de invader projectile
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
                player.opacity = 0
                game.over = true
            }, 0)
            // tijd in miliseconde voor dat de game helemaal stopt nadat je geraakt bent
            setTimeout(() => {
                game.active = false
            }, 2000)
            createParticles({
                object: player,
                color: 'white',
            })
        }
    })

    // player projectiles verwijderen zodra het van het schrerm is
    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })
    // hele lange grid code voor spawnen van grid invaders en meer.
    grids.forEach((grid, gridIndex) => {
        grid.update()
        // spawn rate van de invader projectiles na een bepaald aantal frames pas de value aan naar de gewenste spawn rate
        if (frames % 90 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({ speed: grid.speed })

            // player projectiles die invaders kunnen raken 
            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >=
                    invader.position.x &&
                    projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >=
                    invader.position.y
                ) {
                    // verwijder invaders nadat ze geraakt worden door de player projectile  
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(
                            (invader2) => invader2 === invader
                        )
                        const projectileFound = projectiles.find(
                            (projectile2) => projectile2 === projectile
                        )

                        // verwijder projectiles en invaders + score punten telling
                        if (invaderFound && projectileFound) {
                            // punten worden hier gemaakt en weergeven
                            score += Math.ceil(Math.random() * 100) + 10
                            scoreElement.innerHTML = score
                            // Particles creeren voor geraakte invaders en verwijderen van scherm
                            createParticles({
                                object: invader
                            })
                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            // new grid width na dat je een grid hebt weg geschoten + het verwijderen van de grid nadat het is weg geschoten
                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width =
                                    lastInvader.position.x -
                                    firstInvader.position.x +
                                    lastInvader.width
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)
                }
            })
        })
    })

    // werkt samen met addEventlistener dit zorgt ervoor dat wanneer een key wordt in gedrukt er dan ook iets gebeurd 
    if (keys.a.pressed && player.position.x >= 0) {
        player.speed.x = -10
        player.rotation = -.15
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.speed.x = 10
        player.rotation = .15
    } else {
        player.speed.x = 0
        player.rotation = 0
    }
    // spawn time voor nieuwe invaders
    if (frames % randomSpawnInterval === 0) {
        grids.push(new Grid)
        // pas de value na de * operator aan om de spawn rate van de aan te passen en de twee de value is de minimale tijd 
        randomSpawnInterval = Math.ceil(Math.random() * 400) + 300
        frames = 0
        //console.log(randomSpawnInterval)
    }
    frames++
}

// hiermee voer je de fuction animate uit - heel belangrijk.
animate()

// Game controls A, D en space. Dit kan heel makkelijk aan gepast worden.
addEventListener("keydown", ({ key }) => {
    // Game over / als je geraakt wordt kan je de player niet meer zien maar nu heb je ook dat je niet meer kan schieten.
    if (game.over) return
    // console.log(key)
    switch (key) {
        case 'a':
            // console.log('left')
            keys.a.pressed = true
            break
        case 'd':
            // console.log('right')
            keys.d.pressed = true
            break
        case ' ':
            // console.log('space')
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                speed: {
                    x: 0,
                    y: -10
                }
            }))
                // console.log//
                (projectiles)
            break
        case 'm':
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                speed: {
                    x: 0,
                    y: -10
                }
            }))
            break
    }
})
addEventListener("keyup", ({ key }) => {
    switch (key) {
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case ' ':
            break
    }
})