import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import './gamifiedResultTable.css';

const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      cursor: 'pointer'
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);

class GameTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            rows: [],
            sortedKey: 'id',
            sortedType: 'asc'
        }
    }

    createData(id, mtt, ftd) {
        return { id, mtt, ftd };
    }
      
    componentDidMount(){
        let rows = this.props.data;
          rows.sort(function compare(a,b){
            if(!('id' in a) || !('id' in b))
                return 0;
            if(a['id']>b['id'])
                return 1;
            return -1;
        })
          this.setState({
              rows: rows
          });
    }

    componentWillReceiveProps(newProps){
      if(JSON.stringify(newProps.data) != JSON.stringify(this.props.data)){
        let rows = newProps.data;
        rows.sort(function compare(a,b){
          if(!('id' in a) || !('id' in b))
              return 0;
          if(a['id']>b['id'])
              return 1;
          return -1;
        })
        this.setState({
            rows: rows
        });
      }
    }

    displayIcon(key){
        return (
            <span>
                {this.state.sortedKey == key?
                    <span>
                        {this.state.sortedType=='asc'?
                            <ArrowUpward className="iconStyle"/>
                            :
                            <ArrowDownward className="iconStyle"/>
                        }
                    </span>
                    :
                    null
                }
            </span>
        )
    }

    sortData(key){
        let order = 'asc';
        if(this.state.sortedKey == key && this.state.sortedType == 'asc'){
            order = 'desc';
        }
        let rows = this.state.rows;
        rows.sort(function compare(a,b){
            if(!(key in a) || !(key in b))
                return 0;

            if(order=='asc'){
                if(a[key]>b[key])
                    return 1;
                return -1;
            }
            if(a[key]>b[key])
                return -1;
            return 1;
        })
        this.setState({
            rows: rows,
            sortedType: order,
            sortedKey: key
        });
    }
    
    render(){        
        return (
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell onClick={() => {this.sortData('id')}} align="left">Id {this.displayIcon('id')}</StyledTableCell>
                    <StyledTableCell onClick={() => {this.sortData('mtt')}} align="right">Match the topics {this.displayIcon('mtt')}</StyledTableCell>
                    <StyledTableCell onClick={() => {this.sortData('ftd')}} align="right">Fill the dates {this.displayIcon('ftd')}</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.rows.map((row) => (
                    <StyledTableRow key={row.id}>
                      <TableCell align="left">{row.id}</TableCell>
                      <TableCell align="right">{row.mtt}</TableCell>
                      <TableCell align="right">{row.ftd}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
    }
}
export default GameTable;