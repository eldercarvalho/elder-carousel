(function() {
  function ElderCarousel(selector, opts) {
    this.wrapper = null
    this.wrapperWidth = 0
    this.track = null
    this.trackWidth = 0
    this.trackDistance = 0
    this.items = []
    this.itemWidth = 0
    this.settings = Object.assign(ElderCarousel.defaults, opts);
    this.settings.selector = selector
    this.moveType = 'page' // step || page
    this.playInterval = null
    setup(this);
  }

  ElderCarousel.prototype.next = function() {
    this.trackDistance -= this.itemWidth * this.settings.step
    this.moveType = 'step'
    move(this)
  };

  ElderCarousel.prototype.prev = function() {
    this.trackDistance += this.itemWidth * this.settings.step
    this.moveType = 'step'
    move(this)
  };

  ElderCarousel.prototype.goTo = function(index) {
    this.trackDistance = -(index * this.itemWidth)
    this.moveType = 'page'
    move(this)
  };

  ElderCarousel.prototype.play = function() {
    this.playInterval = setInterval(() => {
      this.next()
    }, this.settings.playInterval)
  };

  ElderCarousel.prototype.stop = function() {
    clearInterval(this.playInterval)
  };

  function move (self) {
    self.track.style.transform = `translate3d(${self.trackDistance}px,0,0)`
    updatePagination(self)
  }

  function setup(self) {
   
    buildUI(self)

    if (self.settings.pagination) createPagination(self)

    if (self.settings.navs) createNavs(self)

    if (self.settings.play) self.play()

    setStart(self)
  }

  function addEvents(self) {
    
  }

  function buildUI(self) {
    self.wrapper = document.querySelector(self.settings.selector)
    self.wrapper.classList.add("el-carousel")
    self.wrapperWidth = self.wrapper.clientWidth
    self.itemWidth = self.wrapperWidth / self.settings.items

    self.items = Array.from(self.wrapper.children)
    self.track = document.createElement('div')
    self.track.className = 'el-carousel__track'
    self.track.style.width = self.itemWidth * self.items.length + 'px'
    
    self.items.forEach(item => {
      item.className = 'el-carousel__item'
      item.style.width = self.itemWidth + 'px'
      self.track.appendChild(item)
    })

    let trackHolder = document.createElement('div')
    trackHolder.className = 'el-carousel__holder'
    trackHolder.appendChild(self.track)

    self.wrapper.appendChild(trackHolder)
  }

  function createNavs(self) {
    let prevNav, nextNav

    prevNav = document.createElement('div')
    prevNav.className ='el-carousel__nav el-carousel__nav--prev'
    prevNav.addEventListener('click', () => self.prev())

    nextNav = document.createElement('div')
    nextNav.className = 'el-carousel__nav el-carousel__nav--next'
    nextNav.addEventListener('click', () => self.next())

    self.wrapper.appendChild(prevNav)
    self.wrapper.appendChild(nextNav)
  }

  function createPagination(self) {
    let paginationWrapper = document.createElement('div')
    paginationWrapper.className = 'el-carousel__pagination'
    let dotsLength = self.items.length / self.settings.items
    for (let i = 0; i <= dotsLength; i++) {
      let dot = document.createElement('div')
      dot.className = 'pagination__dot'
      dot.addEventListener('click', function() { self.goTo(i * self.settings.items) })
      paginationWrapper.appendChild(dot)
    }
    self.wrapper.appendChild(paginationWrapper)
  }

  function updatePagination(self) {
    const pageDistance = self.settings.items * self.itemWidth
    console.log(self.settings.items * self.itemWidth)
    const divider = (self.moveType === 'step' ? self.settings.step : self.settings.items) * self.itemWidth 
    const index =  Math.abs(self.trackDistance) / divider
    console.log(index)
    const dots = Array.from(document.querySelectorAll('.pagination__dot'))
    dots.forEach(dot => dot.classList.remove('pagination__dot--active'))
    dots[index].classList.add('pagination__dot--active')
  }

  function setStart(self) {
    self.trackDistance = -(self.settings.start * self.itemWidth)
    move(self)
  }
  
  ElderCarousel.defaults = {
    selector: "",
    items: 3,
    step: 1,
    start: 0,
    pagination: true,
    navs: true,
    navPrev: null,
    infinite: false,
    play: false,
    playInterval: 3000
  };

  window.ElderCarousel = ElderCarousel;
})();
