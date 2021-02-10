pragma solidity ^0.5.6;

/**
 * @title SafeMath
 * @dev Unsigned math operations with safety checks that revert on error
 */
library SafeMath {
    /**
     * @dev Multiplies two unsigned integers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two unsigned integers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

contract ticketOffice {
    
    using SafeMath for uint256;
    
    event NewEvent(string title, address payable organizer, uint256 date, uint256 ticketQuantity, uint256 ticketPrice, uint256 id);
    event TicketSold(uint256 eventId, uint256 ticketId, uint256 price);
    event TicketSetForSale(uint256 eventId, uint256 ticketId, uint256 price);
    
    uint256 feeRate = 50; //in persent
    
    uint256 revenue = 0;
    uint256 artistsReward = 0;
    uint256 charities = 0;
    
    address payable platform = 0xf36cB10f0d271940eF4258c6D97b55268DFAB38a;
    address payable charity = 0xb4C0F4f60a58f167f4794EA69eDcC58Cb46631c0;
    address payable artist = 0xE383Ed15Dd1EE4d19C1e30Cd276Cd902E52AFD6c;
    
    struct Event {
        string title;
        address payable organizer;
        uint256 date;
        uint256 ticketQuantity;
        uint256 initialPrice;
    }
    
    struct Ticket {
        uint256 eventId;
        uint256 ticketId;
        uint256 price;
        address payable owner;
        bool forSale;
    }
    
    Event[] events;
    
    mapping (uint256 => address payable) public eventToOrganizer;
    mapping (address => uint256[]) public organizerToEvent;
    
    mapping (uint256 => Ticket[]) public eventToTickets;
    
    function createEvent(string memory _title, uint256 _date, uint256 _ticketQuantity, uint256 _initialPrice) public {
        
        uint256 id = events.push(Event(_title, msg.sender, _date, _ticketQuantity, _initialPrice)) - 1;
        eventToOrganizer[id] = msg.sender;
        organizerToEvent[msg.sender].push(id);
        
        for (uint256 i = 0; i < _ticketQuantity; i++) {
            eventToTickets[id].push(Ticket(id, i, _initialPrice, msg.sender, true));
        }
        
        emit NewEvent(_title, msg.sender, _date, _ticketQuantity, _initialPrice, id);
        
    }
    
    function buyTicket(uint256 _eventId, uint256 _ticketId) public payable {
        
        uint256 price = eventToTickets[_eventId][_ticketId].price;
        uint256 fee;
        
        require(msg.sender.balance >= price);
        require(msg.value == price);
        require(eventToTickets[_eventId][_ticketId].forSale == true);
        
        if (price > events[_eventId].initialPrice) {
            fee = ((price.sub(events[_eventId].initialPrice)).mul(feeRate).div(100));
        }
        
        else {fee = 0;}
        
        address payable seller = eventToTickets[_eventId][_ticketId].owner;
        seller.transfer(msg.value.sub(fee));
        revenue.add(fee.div(2));
        platform.transfer(fee.div(2));
        artistsReward.add(fee.div(4));
        artist.transfer(fee.div(4));
        charity.transfer(fee.div(5));
        charities.add(fee.div(5));
        
        
        eventToTickets[_eventId][_ticketId].owner = msg.sender;
        eventToTickets[_eventId][_ticketId].forSale = false;
        
        emit TicketSold(_eventId, _ticketId, eventToTickets[_eventId][_ticketId].price);
        
    }
    
    function setForSale(uint256 _eventId, uint256 _ticketId, uint256 _price) public {
        
        require(eventToTickets[_eventId][_ticketId].owner == msg.sender);
        eventToTickets[_eventId][_ticketId].forSale = true;
        eventToTickets[_eventId][_ticketId].price = _price;
        
        emit TicketSetForSale(_eventId, _ticketId, _price);
        
    }
    
    function getEvents(address _organizer) public view returns(uint[] memory) {
        return organizerToEvent[_organizer];
    }
    
    function getEventDetails(uint256 _eventId) public view returns(string memory, uint256, uint256, uint256) {
        
        return (events[_eventId].title, events[_eventId].date, events[_eventId].ticketQuantity, events[_eventId].initialPrice);
    
    }
    
    function getTicket(uint256 _eventId, uint256 _ticketId) public view returns(uint256 eventId, uint256 ticketId, uint256 price, address payable owner, bool forSale) {
        
        eventId = eventToTickets[_eventId][_ticketId].eventId;
        ticketId = eventToTickets[_eventId][_ticketId].ticketId;
        price = eventToTickets[_eventId][_ticketId].price;
        owner = eventToTickets[_eventId][_ticketId].owner;
        forSale = eventToTickets[_eventId][_ticketId].forSale;
        
    }
    
    function getRevenue() public view returns (uint256) {
        return revenue;
    }
    
    function getArtistsReward() public view returns (uint256) {
        return artistsReward;
    }
    
    function getCharities() public view returns (uint256) {
        return charities;
    }
    
}