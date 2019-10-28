(function () {
  function ElderCarousel(selector, opts) {
    this.wrapper = null
    this.wrapperWidth = 0
    this.track = null
    this.trackWidth = 0
    this.trackPosition = 0
    this.startPosition = 0
    // this.trackMouseDown = false
    this.items = []
    this.itemWidth = 0
    this.firstItem = null
    // this.pageDistance = 0
    this.lastItem = null
    this.settings = { ...ElderCarousel.defaults, ...opts };
    this.settings.selector = selector
    this.playInterval = null
    this.navDisabled = false
    this.isEnd = false
    this.isStart = false
    setup(this);
  }

  ElderCarousel.prototype.next = function () {
    // this.isEnd = Math.abs(this.trackPosition) === this.trackWidth - this.itemWidth

    if (!this.settings.loop && this.isEnd || this.items.length === 1) return

    this.trackPosition -= this.itemWidth * this.settings.step

    move(this)
  };

  ElderCarousel.prototype.prev = function () {
    this.isStart = Math.abs(this.trackPosition) === 0

    if (!this.settings.loop && this.isStart || this.items.length === 1) return

    this.trackPosition += this.itemWidth * this.settings.step

    move(this)
  };

  ElderCarousel.prototype.goTo = function (index) {
    this.trackPosition = -(index * this.itemWidth)
    move(this)
  };

  ElderCarousel.prototype.play = function () {

    clearInterval(this.playInterval)

    this.playInterval = setInterval(() => {
      this.next()
    }, this.settings.playInterval)

  };

  ElderCarousel.prototype.stop = function () {
    clearInterval(this.playInterval)
  };

  function move(self) {
    self.track.style.transition = `transform ${self.settings.speed}ms ease`
    self.track.style.transform = `translate3d(${self.trackPosition}px,0,0)`
    // updatePagination(self)
    if (self.settings.play) self.play()
  }

  function setup(self) {

    if (!buildUI(self)) return

    // if (self.settings.pagination) createPagination(self)

    if (self.settings.navs) createNavs(self)

    if (self.settings.play) self.play()

    setTrackStartPosition(self)

    setupEvents(self)
  }

  function buildUI(self) {
    self.wrapper = document.querySelector(self.settings.selector)
    if (!self.wrapper) return false
    self.wrapper.classList.add("ec")
    self.wrapperWidth = self.wrapper.clientWidth
    self.itemWidth = parseInt(self.wrapperWidth / self.settings.items)

    self.items = Array.from(self.wrapper.children)

    if (self.items.length === 0) return false

    self.items.forEach(item => {
      item.classList.add('ec__item')
      item.style.width = self.itemWidth + 'px'
    })

    if (self.items.length > 1) {
       // fazer calcullo com step ao invez de items
      const leftClonedItems = self.items.slice(self.items.length - self.settings.items, self.items.length).map(item => {
        const clonedItem = item.cloneNode(true)
        clonedItem.classList.add('cloned')
        return clonedItem;
      })

      const rightClonedItems = self.items.slice(0, self.settings.items).map(item => {
        const clonedItem = item.cloneNode(true)
        clonedItem.classList.add('cloned')
        return clonedItem;
      })

      self.items = [ ...leftClonedItems, ...self.items, ...rightClonedItems ]
    }

    self.track = document.createElement('div')
    self.track.className = 'ec__track'
    self.trackWidth = self.itemWidth * self.items.length
    self.track.style.width = self.trackWidth + 'px'
    self.items.forEach(item => self.track.appendChild(item))

    const trackHolder = document.createElement('div')
    trackHolder.className = 'ec__holder'
    trackHolder.appendChild(self.track)

    self.wrapper.appendChild(trackHolder)
    return true
  }

  // Atualiza a UI
  function updateUI(self) {
    self.wrapperWidth = self.wrapper.clientWidth
    self.itemWidth = parseInt(self.wrapperWidth / self.settings.items)

    self.trackWidth = self.itemWidth * self.items.length
    self.track.style.width = self.trackWidth + 'px'

    self.items.forEach(item => item.style.width = self.itemWidth + 'px')
  }

  // Adiciona os eventos
  function setupEvents(self) {

    // Eventos da window
    window.addEventListener('resize', () => updateUI(self))

    // Eventos da track
    self.track.addEventListener('transitionstart', () => {
      self.isEnd = Math.abs(self.trackPosition) === self.trackWidth - (self.itemWidth * self.settings.step)

    });

    self.track.addEventListener('transitionend', () => {

      if (self.items.length !== 1) {
        self.isEnd = Math.abs(self.trackPosition) === self.trackWidth - (self.itemWidth * self.settings.items)
        if (self.isEnd) setTrackStartPosition(self)

        self.isStart = Math.abs(self.trackPosition) === 0
        if (self.isStart) setTrackEndPosition(self)
      }

      self.navDisabled = false
    })
  }

  // Cria os botões de navegação
  function createNavs(self) {
    let prevNav, nextNav

    // Seta de navegação esquerda
    prevNav = self.settings.prevNav || document.createElement('div')
    prevNav.className = 'ec__nav ec__nav--prev'
    prevNav.setAttribute('role', 'button')
    prevNav.setAttribute('disabled', 'true')
    prevNav.addEventListener('click', () => {
      if (self.navDisabled) return
      self.navDisabled = true
      self.prev()
    })

    // Seta de navegação direita
    nextNav = self.settings.nextNav || document.createElement('div')
    nextNav.className = 'ec__nav ec__nav--next'
    nextNav.setAttribute('role', 'button')
    nextNav.addEventListener('click', () => {
      if (self.navDisabled) return
      self.navDisabled = true
      self.next()
    })

    self.wrapper.appendChild(prevNav)
    self.wrapper.appendChild(nextNav)
  }

  function debounce(fn, ms) {
    let timer = 0
    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
  }

  function createPagination(self) {
    let paginationWrapperEl = document.createElement('div')
    paginationWrapperEl.className = 'ec__pagination'
    let dotsLength = self.items.length / self.settings.items
    for (let i = 0; i < dotsLength; i++) {
      let dot = document.createElement('div')
      dot.className = 'pagination__dot'
      const index = i * self.settings.items
      dot.addEventListener('click', function () { self.goTo(index) })
      paginationWrapperEl.appendChild(dot)
    }
    self.wrapper.appendChild(paginationWrapperEl)
  }

  function updatePagination(self) {
    const PAGE_DISTANCE = self.settings.items * self.itemWidth
    if (Math.abs(self.trackPosition) % PAGE_DISTANCE === 0) {
      const index = Math.abs(self.trackPosition) / PAGE_DISTANCE
      const paginationDotsNodeList = self.wrapper.querySelectorAll('.pagination__dot')
      const dots = Array.from(paginationDotsNodeList)
      dots.forEach(dot => dot.classList.remove('pagination__dot--active'))
      dots[index].classList.add('pagination__dot--active')
    }
  }

  function setTrackStartPosition(self) {
    if (self.items.length === 1) {
      self.trackPosition = 0
    } else {
      self.startPosition = (self.settings.start + self.settings.items) * self.itemWidth
      self.trackPosition = self.startPosition * -1
    }
    setTrackPosition(self)
  }

  function setTrackEndPosition(self) {
    self.endPosition = Math.abs(self.trackPosition) - (self.itemWidth * (self.settings.items * 2 + 1))
    self.trackPosition = self.endPosition
    setTrackPosition(self)
  }

  function setTrackPosition(self) {
    self.track.style.transitionProperty = 'none'
    self.track.style.transform = `translate3d(${self.trackPosition}px,0,0)`
  }

  function loop(self) {
    const firstItemClone = self.firstItem.cloneNode(true)
    firstItemClone.classList.add('cloned')
    self.items.push(firstItemClone)
    self.track.appendChild(firstItemClone)
    updateUI(self);
    move(self);
  }

  ElderCarousel.defaults = {
    selector: '',
    items: 3,
    step: 1,
    speed: 300,
    start: 0,
    pagination: true,
    navs: true,
    // navPrev: null,
    loop: true,
    play: false,
    playInterval: 3000
  };

  window.ElderCarousel = ElderCarousel;
})();
