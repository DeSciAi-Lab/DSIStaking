// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DSIStaking is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable stakingToken;
    uint256 internal constant SECONDS_IN_MONTH = 2592000; // 30 days in seconds
    uint256 internal constant SECONDS_IN_DAY = 86400; // 24 hours in seconds
    uint256 public rewardFactor = 20; // 20% increase per month of staking
    uint256 public minimumStake = 100 * 1e18; // 100 DSI tokens (assuming 18 decimals)
    uint256 public maxDSIPowerAccumulationDuration = 365 days; // Maximum duration for DSI-Power calculation

    uint256 public totalStaked;
    uint256 public totalStakers;
    uint256 public totalActiveDSIPower;
    uint256 public numberOfActiveDSIPowerHolders;
    mapping(address => uint256) public userActiveDSIPower;
    mapping(address => bool) public isStakerRegistered;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 dsiPower;
        bool claimed;
    }

    // Mapping from user address to their stakes
    mapping(address => Stake[]) public userStakes;

    // Events
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 duration,
        uint256 dsiPower
    );
    event Claimed(address indexed user, uint256 amount);
    event StakingMultiplierUpdated(
        uint256 oldMultiplier,
        uint256 newMultiplier
    );
    event MinimumStakeUpdated(uint256 oldMinimum, uint256 newMinimum);
    event maxDSIPowerAccumulationDurationUpdated(
        uint256 oldDuration,
        uint256 newDuration
    );

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
    }

    // Read Functions
    function isStaking(address staker) external view returns (bool) {
        Stake[] memory stakes = userStakes[staker];
        for (uint256 i = 0; i < stakes.length; i++) {
            if (!stakes[i].claimed && block.timestamp < stakes[i].endTime) {
                return true;
            }
        }
        return false;
    }

    function getAllStakes(address user) external view returns (Stake[] memory) {
        return userStakes[user];
    }

    function getStakeDetails(
        address user,
        uint256 stakeId
    ) external view returns (Stake memory) {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        return userStakes[user][stakeId];
    }

    function getStakingFormula() external pure returns (string memory) {
        return
            "DSI-Power = tokens * (duration/86400) * (1 + (duration/2592000) * (rewardFactor/100))";
    }

    function calculateDSIPower(
        uint256 amount,
        uint256 duration
    ) public view returns (uint256) {
        // Cap the duration to maxDSIPowerAccumulationDuration
        uint256 effectiveDuration = duration > maxDSIPowerAccumulationDuration
            ? maxDSIPowerAccumulationDuration
            : duration;

        // First calculate days multiplier: duration/86400
        uint256 daysMultiplier = (effectiveDuration * 1e18) / SECONDS_IN_DAY;

        // Calculate the bonus multiplier: 1 + (duration/2592000) * (rewardFactor/100)
        uint256 durationInMonths = (effectiveDuration * 1e18) /
            SECONDS_IN_MONTH;
        uint256 bonusMultiplier = (durationInMonths * rewardFactor) / 100;
        uint256 totalBonusMultiplier = 1e18 + bonusMultiplier;

        // Calculate final DSI-Power with precision handling
        uint256 dsiPower = (amount * daysMultiplier) / 1e18; // tokens * days
        dsiPower = (dsiPower * totalBonusMultiplier) / 1e18; // multiply by bonus

        return dsiPower;
    }

    // Write Functions
    function stake(
        uint256 amount,
        uint256 duration
    ) external nonReentrant whenNotPaused {
        require(amount >= minimumStake, "Amount below minimum stake");
        require(duration > 0, "Duration must be greater than 0");

        // Register new staker if not already registered
        if (!isStakerRegistered[msg.sender]) {
            isStakerRegistered[msg.sender] = true;
            totalStakers++;
        }

        // Calculate DSI-Power using new formula
        uint256 dsiPower = calculateDSIPower(amount, duration);

        // Update DSI Power tracking
        if (userActiveDSIPower[msg.sender] == 0) {
            numberOfActiveDSIPowerHolders++;
        }
        userActiveDSIPower[msg.sender] += dsiPower;
        totalActiveDSIPower += dsiPower;

        // Transfer tokens to contract
        require(
            stakingToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Create new stake
        userStakes[msg.sender].push(
            Stake({
                amount: amount,
                startTime: block.timestamp,
                endTime: block.timestamp + duration,
                dsiPower: dsiPower,
                claimed: false
            })
        );

        totalStaked += amount;

        emit Staked(msg.sender, amount, duration, dsiPower);
    }

    function claimUnlockedTokens() external nonReentrant {
        Stake[] storage stakes = userStakes[msg.sender];
        uint256 totalToReturn = 0;
        uint256 totalDSIPowerToRemove = 0;

        for (uint256 i = 0; i < stakes.length; i++) {
            if (!stakes[i].claimed && block.timestamp >= stakes[i].endTime) {
                stakes[i].claimed = true;
                totalToReturn += stakes[i].amount;
                totalStaked -= stakes[i].amount;
                totalDSIPowerToRemove += stakes[i].dsiPower;
            }
        }

        require(totalToReturn > 0, "No tokens to claim");

        // Update DSI Power tracking
        userActiveDSIPower[msg.sender] -= totalDSIPowerToRemove;
        totalActiveDSIPower -= totalDSIPowerToRemove;

        if (userActiveDSIPower[msg.sender] == 0) {
            numberOfActiveDSIPowerHolders--;
        }

        require(
            stakingToken.transfer(msg.sender, totalToReturn),
            "Transfer failed"
        );

        emit Claimed(msg.sender, totalToReturn);
    }

    function claimSpecificStake(uint256 stakeIndex) external nonReentrant {
        Stake[] storage stakes = userStakes[msg.sender];
        require(stakeIndex < stakes.length, "Invalid stake index");
        require(!stakes[stakeIndex].claimed, "Stake already claimed");
        require(
            block.timestamp >= stakes[stakeIndex].endTime,
            "Stake still locked"
        );

        uint256 amountToReturn = stakes[stakeIndex].amount;
        uint256 dsiPowerToRemove = stakes[stakeIndex].dsiPower;

        stakes[stakeIndex].claimed = true;
        totalStaked -= amountToReturn;

        // Update DSI Power tracking
        userActiveDSIPower[msg.sender] -= dsiPowerToRemove;
        totalActiveDSIPower -= dsiPowerToRemove;

        if (userActiveDSIPower[msg.sender] == 0) {
            numberOfActiveDSIPowerHolders--;
        }

        require(
            stakingToken.transfer(msg.sender, amountToReturn),
            "Transfer failed"
        );

        emit Claimed(msg.sender, amountToReturn);
    }

    function getTotalStakers() external view returns (uint256) {
        return totalStakers;
    }

    function calculateActiveStakesDSIPower(
        address user
    ) public view returns (uint256) {
        Stake[] memory stakes = userStakes[user];
        uint256 activeDSIPower = 0;

        for (uint256 i = 0; i < stakes.length; i++) {
            if (!stakes[i].claimed && block.timestamp < stakes[i].endTime) {
                activeDSIPower += stakes[i].dsiPower;
            }
        }

        return activeDSIPower;
    }

    // Admin Functions
    function withdrawStuckTokens(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(
            token != address(stakingToken),
            "Cannot withdraw staking token"
        );
        require(IERC20(token).transfer(owner(), amount), "Transfer failed");
    }

    function pauseStaking() external onlyOwner {
        _pause();
    }

    function resumeStaking() external onlyOwner {
        _unpause();
    }

    function updateRewardFactor(uint256 newFactor) external onlyOwner {
        require(newFactor > 0, "Factor must be greater than 0");
        uint256 oldFactor = rewardFactor;
        rewardFactor = newFactor;
        emit StakingMultiplierUpdated(oldFactor, newFactor);
    }

    function updateMinimumStake(uint256 newMinimum) external onlyOwner {
        require(newMinimum > 0, "Minimum stake must be greater than 0");
        uint256 oldMinimum = minimumStake;
        minimumStake = newMinimum * 1e18; // Convert to token decimals
        emit MinimumStakeUpdated(oldMinimum, minimumStake);
    }

    function updatemaxDSIPowerAccumulationDuration(
        uint256 newDuration
    ) external onlyOwner {
        require(newDuration > 0, "Duration must be greater than 0");
        uint256 oldDuration = maxDSIPowerAccumulationDuration;
        maxDSIPowerAccumulationDuration = newDuration;
        emit maxDSIPowerAccumulationDurationUpdated(oldDuration, newDuration);
    }
}
