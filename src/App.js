import React, { Component } from 'react'
import './App.css'
import { Container, Checkbox, Icon, Dimmer, Header, Loader, Grid, 
  Menu, Segment, Button } from 'semantic-ui-react'

import CompareBoroughData from './components/CompareBoroughData'
import LondonBoroughs from './components/LondonBoroughs'
import ResultsComponent from './components/ResultsComponent'


class App extends Component {
  constructor() {
    super()
    this.state = { 
      data: [],
      selectedBorough: {},
      selectedArea: {},
      showCheckbox: false,
      showModal: false,
      loading: true,
      loaded: false,
      possibleOptions: ['averageSalaryPostedJob', 'crimeRate', 'houseListings'],
      selectedFilters: [],
      filterResult: []
    }
  }
  
  fetchData = () => {
    fetch('http://localhost:3000/boroughs')
    .then( resp => resp.json())
    .then( boroughData => 
      this.setState(
        { data: boroughData }, 
        () => this.setState( { ...this.state, loading: !this.state.loading})
        ) 
      )
  }

  handleBoroughClick = (boroughName) => {
    let borough = boroughName
  
    this.renderPostcodes(borough)
  }

  renderPostcodes = (borough) => {
    console.log(borough)
    if (this.showModal === true){
      
    }
    else {
    let foundBorough = this.state.data.find( fb => fb.name === borough )
    this.setState({ ...this.state, 
      selectedBorough: foundBorough,
      showCheckbox: true})}
  }

  clearFilterResult = () => {
    this.setState( {...this.state, selectedBorough: {},
      selectedArea: {}, selectedFilters: [], showModal: false, loaded: false, showCheckbox: false} )
  }

  toggleLoader = () => {
    if (this.state.loaded === false ){
    this.setState( { ...this.state, loading: !this.state.loading})
    setTimeout(() => this.setState({ ...this.state, loaded: true, loading: !this.state.loading}), 500)

    } else {
      return 
    }
  }

  toggleShow = () => {
    
    !this.state.showCheckbox 
    ? this.setState({...this.state, showCheckbox: true})
    : this.setState({...this.state, showCheckbox: false})
  }

  sortedPostcodes = (postcodes) => {

    let options = this.state.selectedFilters

    const optionSortMethods = {
      averageSalaryPostedJob: 'asc',
      houseListings: 'asc',
      crimeRate: 'desc'
    }

      if (this.state.selectedFilters.length === 0) return postcodes;

      const postcodeToDifference = (averages, options) => {
        return (postcode) =>
          options.reduce((sum, option) => {
            return sum + (optionSortMethods[option] === 'asc' ? 
              postcode[option] / averages[option] : 
              averages[option] / postcode[option])
          }, 0)
      }
  
      const compareTwoPostcodes = (averages, options) => {
        const getDifference = postcodeToDifference(averages, options)
        return (pa, pb) => getDifference(pb) - getDifference(pa)
      }
      
      const getAverages = postcodes => {
        const totals = postcodes.reduce((totals, postcode, i) => {
          if (Object.keys(totals).length === 0) return Object.assign(totals, postcode)
          
  
          Object.keys(postcode)
            .map(key => {
              totals[key] += postcode[key]
            })
  
          return totals
        }, {})
  
        return Object.keys(totals)
          .reduce((averages, key) => {
            averages[key] = totals[key] / postcodes.length
            return averages
          }, {})
      }
      
      return postcodes.sort(compareTwoPostcodes(getAverages(postcodes), this.state.selectedFilters))
  }
  


  onSelectCheckbox = (option) => { 
 
      if (!this.state.selectedFilters.includes(option)){
        this.setState({ 
          ...this.state, showModal: true,
          selectedFilters: [...this.state.selectedFilters, option]
        })
      }
      else {
        this.setState({
          ...this.state,
            selectedFilters: this.state.selectedFilters.filter( o => o !== option )
        })
 }
}

  componentDidMount(){
    this.fetchData()
  }

  render () {

    return (
      this.state.loading
      ?
      <Dimmer active>
          <Loader indeterminate>Loading</Loader>
      </Dimmer>
      :
      <div className='App'>
        <Menu fixed='top' style={{ marginBotton: '4em', position: 'inherit'}}>
          <Menu.Item>
            <div class='App-logo'>
            <Header style={{ fontFamily: 'Satisfy' }}>Bb</Header>
            </div>
          </Menu.Item>
          <Menu.Item name='credits' onClick={null}>Credits</Menu.Item>
        </Menu>
        <Header className='title'>Bborough</Header>
        <Header as='h5' style={{ marginBottom: '4em'}}>Helping you to find the perfect place to live</Header>
          <Container>
            <LondonBoroughs handleBoroughClick={this.handleBoroughClick}/>
          </Container>
          <Container style={{ marginTop: '2em', marginBottom: '2em'}}>
            {
              !!this.state.selectedBorough.name && `Borough: ${this.state.selectedBorough.name}`
            }
            <br/>
            <p/>
            { this.state.showCheckbox
            ? 
            <div>
            <span>Filter area by:</span><br/>
            {
              
              // change label here to change textbox names
              this.state.possibleOptions.map( option =>{
                // this.onSelectCheckbox(e.target.innerText)
                
                if ( option === 'averageSalaryPostedJob'){
                return <Checkbox style={{ padding: '1em'}} name={option} label='Salary' onChange={(e) =>{
                  this.onSelectCheckbox(e.target.parentElement.firstChild.name)}}/>
                }
                else if ( option === 'crimeRate'){
                  return <Checkbox style={{ padding: '1em'}} name={option} label='Crime' onChange={(e) =>{
                    this.onSelectCheckbox(e.target.parentElement.firstChild.name)}}/>
                  }
                else if (option === 'houseListings'){
                  return <Checkbox style={{ padding: '1em'}} name={option} label='Home listings' onChange={(e) =>{
                    this.onSelectCheckbox(e.target.parentElement.firstChild.name)}}/>
                  }
                }
              )
            }
            </div> 
            : <div><span>Pick a borough</span><br/><span>or</span></div> }
            
            <Container text style={{marginTop: '2em', marginBottom: '2em'}}>
            {this.state.showModal 
              ? <ResultsComponent 
              filterResult={this.sortedPostcodes}
              borough={this.state.selectedBorough}
              clearFilterResult={this.clearFilterResult}
              usedFilters={this.state.selectedFilters}
              returnedFilterResult={this.state.filterResult}
              findRank={this.findRank}/>
              
              :
              <div></div>
            }
            </Container>
          </Container>
          <Container text style={{marginTop: '2em', marginBottom: '2em'}}>
           { !this.state.loaded ? <CompareBoroughData boroughs={this.state.data}/> : <div></div> }
          </Container>
      </div>
    )
  }
}

export default App
