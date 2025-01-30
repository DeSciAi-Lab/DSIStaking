import React, { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import {
  ChakraProvider,
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  useToast,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  Flex,
  Image,
  extendTheme,
  Tabs,
  TabList,
  Tab,
  Progress,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
  useDisclosure,
  List,
  ListItem,
  UnorderedList,
  TabPanels,
  TabPanel,
  Portal,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Stack,
  Badge,
  Circle,
  Square,
  useMediaQuery,
  AspectRatio,
  Grid,
  GridItem,
  SimpleGrid,
  Wrap,
  WrapItem,
  Center,
  Link,
  Spacer,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure as usePopoverDisclosure,
  Collapse,
  SlideFade,
  ScaleFade,
  Fade,
  Spinner,
  useTheme,
  useToken,
  useStyleConfig,
  chakra,
  shouldForwardProp,
  createIcon,
  Icon,
  forwardRef,
  useMultiStyleConfig,
  useStyles,
  ThemeProvider,
  useControllableState,
  useCallbackRef,
  useMergeRefs,
  useBoolean,
  useConst,
  useLatestRef,
  useUpdateEffect,
  useEventListener,
  useTheme as useChakraTheme,
} from '@chakra-ui/react';
import { InfoIcon, QuestionIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaWallet } from 'react-icons/fa';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import DSIStakingContract from './contracts/DSIStaking.json';

// Create custom theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0A0B1E', // Darker background matching DeSciAI
        color: 'white',
        minH: '100vh',
        overflowX: 'hidden',
        transition: 'all 0.3s ease-in-out'
      },
      'html': {
        scrollBehavior: 'smooth'
      }
    }
  },
  colors: {
    brand: {
      50: '#e9e4ff',
      100: '#c5b7ff',
      200: '#a089ff',
      300: '#8B5CF6', // Primary purple from DeSciAI
      400: '#7C3AED', // Darker purple
      500: '#6D28D9',
      600: '#5B21B6',
      700: '#4C1D95',
      800: '#3A1674',
      900: '#2E1065',
    },
    accent: {
      blue: '#60A5FA',
      purple: '#8B5CF6',
      pink: '#EC4899'
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: '2xl',
        transition: 'all 0.2s ease-in-out',
        _focus: {
          boxShadow: '0 0 0 3px var(--chakra-colors-brand-400)',
        },
        _active: {
          transform: 'scale(0.98)'
        }
      },
      variants: {
        solid: {
          bg: 'brand.400',
          color: 'white',
          _hover: {
            bg: 'brand.500',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          },
          _active: {
            bg: 'brand.600',
            transform: 'translateY(0)',
          }
        },
        ghost: {
          color: 'whiteAlpha.900',
          backdropFilter: 'blur(8px)',
          _hover: {
            bg: 'whiteAlpha.100',
            transform: 'translateY(-1px)',
          }
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '2xl',
        transition: 'all 0.2s ease-in-out'
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'whiteAlpha.50',
            backdropFilter: 'blur(8px)',
            borderRadius: 'xl',
            transition: 'all 0.2s ease-in-out',
            _hover: {
              bg: 'whiteAlpha.100',
            },
            _focus: {
              bg: 'whiteAlpha.100',
              borderColor: 'brand.300',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-300)',
            }
          }
        }
      }
    },
    Progress: {
      baseStyle: {
        track: {
          bg: 'whiteAlpha.50'
        },
        filledTrack: {
          transition: 'all 0.4s ease-in-out',
          bg: 'linear-gradient(90deg, #8B5CF6, #EC4899)'
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'whiteAlpha.50',
          backdropFilter: 'blur(12px)',
          borderRadius: '2xl',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.100'
        }
      }
    }
  },
});

// Initialize web3Modal outside the component
const web3Modal = new Web3Modal({
  network: "binance-testnet",
  cacheProvider: true,
});

// BSC Testnet Parameters
const BSC_TESTNET_PARAMS = {
  chainId: '0x61', // 97 in hexadecimal
  chainName: 'BSC Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Initialize read-only provider and contract outside the component
const readProvider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const readOnlyContract = new ethers.Contract(
  DSIStakingContract.address,
  DSIStakingContract.abi,
  readProvider
);

// Add custom notification styles
const notificationSlide = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDuration, setStakeDuration] = useState('1');
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [userStakes, setUserStakes] = useState([]);
  const [minimumStake, setMinimumStake] = useState('0');
  const [loading, setLoading] = useState(false);
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalStakers, setTotalStakers] = useState(0);
  const [activeDSIPowerHolders, setActiveDSIPowerHolders] = useState(0);
  const [totalActiveDSIPower, setTotalActiveDSIPower] = useState('0');
  const [userUnclaimedStaked, setUserUnclaimedStaked] = useState('0');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isValidDuration, setIsValidDuration] = useState(true);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showPowerInfo, setShowPowerInfo] = useState(false);
  const [estimatedDSIPower, setEstimatedDSIPower] = useState('0');
  const [totalEarnedPower, setTotalEarnedPower] = useState('0');
  const [claimingStakes, setClaimingStakes] = useState({});
  const [claimAllLoading, setClaimAllLoading] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    // Check if there's a cached provider and connect automatically
    if (web3Modal.cachedProvider) {
      connectWallet();
    }

    // Subscribe to Web3Modal events
    window.ethereum?.on("accountsChanged", handleAccountsChanged);
    window.ethereum?.on("chainChanged", handleChainChanged);
    window.ethereum?.on("disconnect", handleDisconnect);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
      window.ethereum?.removeListener("disconnect", handleDisconnect);
    };
  }, []); // Empty dependency array

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(
        DSIStakingContract.address,
        DSIStakingContract.abi,
        signer
      );
      setContract(contract);
    }
  }, [signer]);

  useEffect(() => {
    if (contract && account) {
      fetchUserStakes();
      fetchMinimumStake();
      fetchTokenBalance();
    }
  }, [contract, account]);

  // Move fetchGlobalStats outside useEffect and make it a component function
  const fetchGlobalStats = async () => {
    try {
      const [totalStakedAmount, totalStakersCount, activeHolders, activePower] = await Promise.all([
        readOnlyContract.totalStaked(),
        readOnlyContract.totalStakers(),
        readOnlyContract.numberOfActiveDSIPowerHolders(),
        readOnlyContract.totalActiveDSIPower()
      ]);

      setTotalStaked(ethers.utils.formatEther(totalStakedAmount));
      setTotalStakers(totalStakersCount.toNumber());
      setActiveDSIPowerHolders(activeHolders.toNumber());
      setTotalActiveDSIPower(ethers.utils.formatEther(activePower));
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  // Update the useEffect to fetch global stats immediately and periodically
  useEffect(() => {
    fetchGlobalStats(); // Fetch immediately when component mounts
    const interval = setInterval(fetchGlobalStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []); // Remove readContract dependency since we're using readOnlyContract

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_PARAMS.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_TESTNET_PARAMS],
          });
        } catch (addError) {
          throw addError;
        }
      }
      throw switchError;
    }
  };

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      
      // Check if we're on the correct network
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 97) {
        await switchNetwork();
        // Refresh provider after network switch
        web3Provider = new ethers.providers.Web3Provider(instance);
      }

      const web3Signer = web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);

    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect wallet",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const disconnectWallet = async () => {
    if (provider?.disconnect) {
      await provider.disconnect();
    }
    web3Modal.clearCachedProvider();
    
    // Reset only user-specific data
    setAccount('');
    setSigner(null);
    setProvider(null);
    setContract(null);
    setUserStakes([]);
    setTokenBalance('0');
    setTotalEarnedPower('0');
    setUserUnclaimedStaked('0');
    setStakeAmount('');
    setStakeDuration('1');
    setEstimatedDSIPower('0');
    
    // Do not reset global statistics
    // setTotalStaked('0');
    // setTotalStakers(0);
    // setActiveDSIPowerHolders(0);
    // setTotalActiveDSIPower('0');
    
    window.localStorage.clear();
  };

  const fetchUserStakes = async () => {
    try {
      const stakes = await contract.getAllStakes(account);
      setUserStakes(stakes);
      calculateTotalEarnedPower();
    } catch (error) {
      console.error("Error fetching stakes:", error);
    }
  };

  const fetchMinimumStake = async () => {
    try {
      const min = await contract.minimumStake();
      setMinimumStake(ethers.utils.formatEther(min));
    } catch (error) {
      console.error("Error fetching minimum stake:", error);
    }
  };

  const fetchTokenBalance = async () => {
    if (!contract || !account) return;
    try {
      setIsLoadingBalance(true);
      const tokenAddress = await contract.stakingToken();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        signer
      );
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Inside App component, update the toast calls
  const showNotification = (title, description, status = 'success') => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: 'bottom-right',
      variant: 'solid',
      animation: `${notificationSlide} 0.4s ease-out`,
      render: ({ onClose }) => (
        <Box
          p="4"
          bg={status === 'success' ? 'green.500' : status === 'error' ? 'red.500' : 'blue.500'}
          color="white"
          borderRadius="xl"
          boxShadow="xl"
          position="relative"
          animation={`${notificationSlide} 0.4s ease-out`}
          onClick={onClose}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ transform: 'translateY(-2px)' }}
        >
          <Text fontWeight="bold" mb="1">{title}</Text>
          <Text fontSize="sm">{description}</Text>
        </Box>
      )
    });
  };

  // Update success notifications
  const handleStake = async () => {
    if (!stakeAmount || !stakeDuration) return;

    try {
      setLoading(true);
      const amount = ethers.utils.parseEther(stakeAmount);
      
      // Convert days to seconds
      const duration = parseInt(stakeDuration) * 24 * 60 * 60; // days to seconds

      // First approve the token transfer
      const tokenAddress = await contract.stakingToken();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );

      const approveTx = await tokenContract.approve(DSIStakingContract.address, amount);
      await approveTx.wait();

      // Then stake
      const tx = await contract.stake(amount, duration);
      await tx.wait();

      showNotification(
        "Staking Successful",
        `Successfully staked ${stakeAmount} DSI tokens for ${stakeDuration} days!`
      );

      fetchUserStakes();
      setStakeAmount('');
    } catch (error) {
      console.error("Error staking:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isStakeClaimable = (stake) => {
    if (!stake || stake.claimed) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return stake.endTime.toNumber() <= currentTime;
  };

  const handleClaim = async (stakeIndex, stake) => {
    if (!contract || !stake) return;
    
    try {
      if (!isStakeClaimable(stake)) {
        toast({
          title: "Error",
          description: "This stake is still locked. Please wait until the staking period ends.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Set loading state for this specific stake
      setClaimingStakes(prev => ({ ...prev, [stakeIndex]: true }));
      
      const allStakes = await contract.getAllStakes(account);
      const actualIndex = allStakes.findIndex(s => 
        s.amount.eq(stake.amount) && 
        s.startTime.eq(stake.startTime) && 
        s.endTime.eq(stake.endTime)
      );

      if (actualIndex === -1) {
        throw new Error("Stake not found");
      }

      const tx = await contract.claimSpecificStake(actualIndex);
      await tx.wait();

      showNotification(
        "Claim Successful",
        `Successfully claimed ${ethers.utils.formatEther(stake.amount)} DSI tokens!`
      );

      await Promise.all([
        fetchUserStakes(),
        fetchTokenBalance(),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error("Error claiming stake:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to claim stake. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      // Clear loading state for this specific stake
      setClaimingStakes(prev => ({ ...prev, [stakeIndex]: false }));
    }
  };

  // Add validation functions
  const validateAmount = (value) => {
    if (!value || value <= 0) {
      return 'Amount must be greater than 0';
    }
    if (parseFloat(value) < parseFloat(minimumStake)) {
      return `Amount must be at least ${minimumStake} DSI`;
    }
    if (parseFloat(value) > parseFloat(tokenBalance)) {
      return 'Insufficient balance';
    }
    return '';
  };

  const validateDuration = (value) => {
    if (!value || value <= 0) {
      return 'Duration must be greater than 0';
    }
    return '';
  };

  // Add function to check if duration exceeds 365 days
  const isDurationOverOneYear = (duration) => {
    return parseInt(duration) > 365;
  };

  // Update input handlers with validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    setStakeAmount(value);
    setIsValidAmount(!validateAmount(value));
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setStakeDuration(value);
    setIsValidDuration(value > 0);
  };

  // Modified calculateEstimatedDSIPower function with 365-day cap
  const calculateEstimatedDSIPower = async () => {
    if (!contract || !stakeAmount || !stakeDuration) {
      setEstimatedDSIPower('0');
      return;
    }

    try {
      const amount = ethers.utils.parseEther(stakeAmount);
      // Cap the duration at 365 days for DSI-Power calculation
      const durationInDays = Math.min(parseInt(stakeDuration), 365);
      const duration = durationInDays * 24 * 60 * 60;
      const power = await contract.calculateDSIPower(amount, duration);
      setEstimatedDSIPower(ethers.utils.formatEther(power));
    } catch (error) {
      console.error("Error calculating DSI Power:", error);
      setEstimatedDSIPower('0');
    }
  };

  // Add useEffect for DSI Power calculation
  useEffect(() => {
    calculateEstimatedDSIPower();
  }, [stakeAmount, stakeDuration, contract]);

  // Add function to calculate total earned power
  const calculateTotalEarnedPower = () => {
    if (!userStakes.length) {
      setTotalEarnedPower('0');
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const totalPower = userStakes.reduce((total, stake) => {
      if (!stake.claimed && stake.endTime.toNumber() > currentTime) {
        return total.add(stake.dsiPower);
      }
      return total;
    }, ethers.BigNumber.from(0));

    setTotalEarnedPower(ethers.utils.formatEther(totalPower));
  };

  // Update useEffect to calculate total earned power when stakes change
  useEffect(() => {
    calculateTotalEarnedPower();
  }, [userStakes]);

  const calculateUserUnclaimedStaked = () => {
    if (!userStakes.length) {
      setUserUnclaimedStaked('0');
      return;
    }

    const unclaimedTotal = userStakes.reduce((total, stake) => {
      if (!stake.claimed) {
        return total.add(stake.amount);
      }
      return total;
    }, ethers.BigNumber.from(0));

    setUserUnclaimedStaked(ethers.utils.formatEther(unclaimedTotal));
  };

  // Add useEffect to calculate user's unclaimed staked amount when stakes change
  useEffect(() => {
    calculateUserUnclaimedStaked();
  }, [userStakes]);

  // Also update the UI to show if a stake is claimable
  const formatTimeLeft = (endTime) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = endTime - currentTime;
    
    if (timeLeft <= 0) return "Ready to claim";
    
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "< 1h left";
  };

  const handleClaimAll = async () => {
    if (!contract || !userStakes.length) return;
    
    try {
      setClaimAllLoading(true);
      
      const allStakes = await contract.getAllStakes(account);
      const claimableStakes = [];
      
      for (let i = 0; i < allStakes.length; i++) {
        const stake = allStakes[i];
        if (!stake.claimed && stake.endTime.toNumber() <= Math.floor(Date.now() / 1000)) {
          claimableStakes.push(i);
        }
      }
      
      if (claimableStakes.length === 0) {
        toast({
          title: "Info",
          description: "No stakes are ready to be claimed yet",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      for (const stakeIndex of claimableStakes) {
        const tx = await contract.claimSpecificStake(stakeIndex);
        await tx.wait();
      }

      showNotification(
        "Bulk Claim Successful",
        `Successfully claimed ${claimableStakes.length} stakes!`
      );

      await Promise.all([
        fetchUserStakes(),
        fetchTokenBalance(),
        fetchGlobalStats()
      ]);
    } catch (error) {
      console.error("Error claiming all stakes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to claim stakes. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setClaimAllLoading(false);
      setClaimingStakes({});
    }
  };

  // Add this function to calculate power percentage
  const calculateDSIPowerPercentage = () => {
    if (!totalActiveDSIPower || parseFloat(totalActiveDSIPower) === 0) return 0;
    return (parseFloat(totalEarnedPower) / parseFloat(totalActiveDSIPower)) * 100;
  };

  // Add function to calculate normal DSI Power (for holding)
  const calculateNormalDSIPower = (amount, durationInDays) => {
    if (!amount || !durationInDays) return 0;
    return amount * durationInDays;
  };

  // Add function to calculate power multiplier
  const calculatePowerMultiplier = () => {
    if (!stakeAmount || !stakeDuration || parseFloat(estimatedDSIPower) === 0) return 0;
    
    const normalPower = calculateNormalDSIPower(parseFloat(stakeAmount), parseFloat(stakeDuration));
    const stakingPower = parseFloat(estimatedDSIPower);
    
    return stakingPower / normalPower;
  };

  // Update the calculateUserTier function
  const calculateUserTier = () => {
    const powerShare = calculateDSIPowerPercentage();
    if (powerShare >= 1) return 5;
    if (powerShare >= 0.1) return 4;
    if (powerShare >= 0.01) return 3;
    if (powerShare >= 0.001) return 2;
    if (powerShare > 0) return 1;
    return 0; // No tier if power share is 0
  };

  // Add pulse animation for claim button when ready
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="#0A0B1E">
        {/* Navigation */}
        <Flex 
          as="nav" 
          align="center" 
          justify="space-between" 
          padding="4" 
          bg="rgba(10, 11, 30, 0.8)"
          borderBottom="1px"
          borderColor="whiteAlpha.100"
          position="sticky"
          top="0"
          zIndex="sticky"
          backdropFilter="blur(12px)"
        >
          <HStack spacing="8">
            <Text fontSize="2xl" fontWeight="bold" color="brand.300">DeSciAI</Text>
            <HStack spacing="6">
              <Button variant="ghost">Projects</Button>
              <Button variant="ghost" isActive>Staking</Button>
              <Button variant="ghost">Apply</Button>
              <Button variant="ghost">Dashboard</Button>
            </HStack>
          </HStack>
          <Button
            onClick={account ? disconnectWallet : connectWallet}
            variant="solid"
            size="lg"
            leftIcon={<FaWallet />}
          >
            {!account ? "Connect Wallet" : `${account.slice(0, 6)}...${account.slice(-4)}`}
          </Button>
        </Flex>

        <Container maxW="container.xl" py="12">
          {/* Header/Hero Section */}
          <Box mb="16" textAlign="center" position="relative">
            {/* Background gradient effect */}
            <Box
              position="absolute"
              top="-50px"
              left="50%"
              transform="translateX(-50%)"
              width="100%"
              height="300px"
              background="radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.05) 40%, transparent 70%)"
              filter="blur(60px)"
              zIndex="0"
            />
            
            {/* Content */}
            <VStack spacing="8" position="relative" zIndex="1">
              <Heading 
                size="2xl" 
                bgGradient="linear(to-r, accent.purple, accent.pink)" 
                bgClip="text"
                letterSpacing="tight"
                fontSize={{ base: "4xl", md: "7xl" }}
                fontWeight="extrabold"
                position="relative"
                _after={{
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '4px',
                  borderRadius: 'full',
                  bgGradient: 'linear(to-r, accent.purple, accent.pink)',
                }}
              >
                Stake DSI
              </Heading>

              <HStack 
                spacing="4" 
                mt="2"
              >
                <Box
                  px="4"
                  py="2"
                  bg="whiteAlpha.100"
                  borderRadius="full"
                  backdropFilter="blur(8px)"
                >
                  <Text fontSize="md" color="whiteAlpha.900">
                    Up to 3.5x more DSI Power
                  </Text>
                </Box>
                <Box
                  px="4"
                  py="2"
                  bg="whiteAlpha.100"
                  borderRadius="full"
                  backdropFilter="blur(8px)"
                >
                  <Text fontSize="md" color="whiteAlpha.900">
                    Instant DSI Power
                  </Text>
                </Box>
              </HStack>

              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                color="whiteAlpha.800" 
                maxW="3xl" 
                mx="auto" 
                lineHeight="tall"
                mt="4"
              >
                Maximize your contribution cap by staking DSI tokens.{" "}
                <Text as="span" color="brand.300" fontWeight="bold">
                  Earn up to 3.5x more DSI-Power
                </Text>
                {" "}instantly compared to holding.
              </Text>
            </VStack>
          </Box>

          {/* Global Statistics */}
          <Box 
            mb="12" 
            p="8" 
            bg="whiteAlpha.50" 
            borderRadius="2xl" 
            borderWidth="1px" 
            borderColor="whiteAlpha.200"
            backdropFilter="blur(12px)"
            boxShadow="xl"
            position="relative"
            overflow="hidden"
          >
            {/* Background gradient for stats */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              background="linear-gradient(180deg, rgba(123, 91, 255, 0.05) 0%, transparent 100%)"
              zIndex="0"
            />

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="8" position="relative" zIndex="1">
              <Box p="6" bg="whiteAlpha.100" borderRadius="xl" backdropFilter="blur(8px)">
                <Text color="whiteAlpha.600" fontSize="sm" mb="2">Total Value Locked</Text>
                <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, brand.300, purple.400)" bgClip="text">
                  {parseFloat(totalStaked).toLocaleString()} DSI
                </Text>
              </Box>

              <Box p="6" bg="whiteAlpha.100" borderRadius="xl" backdropFilter="blur(8px)">
                <Text color="whiteAlpha.600" fontSize="sm" mb="2">Total Stakers</Text>
                <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, brand.300, purple.400)" bgClip="text">
                  {totalStakers}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.600" mt="1">
                  Unique stakers
                </Text>
              </Box>

              <Box p="6" bg="whiteAlpha.100" borderRadius="xl" backdropFilter="blur(8px)">
                <Text color="whiteAlpha.600" fontSize="sm" mb="2">Total DSI Power</Text>
                <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, brand.300, purple.400)" bgClip="text">
                  {parseFloat(totalActiveDSIPower).toFixed(3)}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.600" mt="1">
                  From {activeDSIPowerHolders} active holder{activeDSIPowerHolders !== 1 ? 's' : ''}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Main Content */}
          <Flex gap="8" direction={{ base: 'column', lg: 'row' }} align="stretch">
            {/* Left Panel */}
            <Box 
              flex="1" 
              bg="whiteAlpha.50" 
              p="8" 
              borderRadius="2xl" 
              borderWidth="1px" 
              borderColor="whiteAlpha.200"
              backdropFilter="blur(12px)"
              boxShadow="xl"
              transition="all 0.3s ease-in-out"
              _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
            >
              <Tabs variant="soft-rounded" colorScheme="brand" mb="6">
                <TabList>
                  <Tab>Stake</Tab>
                  <Tab>Unstake</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p="0">
                    <Flex justify="space-between" mb="6">
                      <Box>
                        <Text color="whiteAlpha.700">Available to stake</Text>
                        <Skeleton
                          isLoaded={!isLoadingBalance}
                          startColor="whiteAlpha.100"
                          endColor="whiteAlpha.300"
                          borderRadius="xl"
                        >
                          <Text fontSize="2xl" fontWeight="bold">{tokenBalance} DSI</Text>
                        </Skeleton>
                      </Box>
                      <Box textAlign="right">
                        <Text color="whiteAlpha.700">Currently staked</Text>
                        <Skeleton
                          isLoaded={!isLoadingBalance}
                          startColor="whiteAlpha.100"
                          endColor="whiteAlpha.300"
                          borderRadius="xl"
                        >
                          <Text fontSize="2xl" fontWeight="bold">{userUnclaimedStaked} DSI</Text>
                        </Skeleton>
                      </Box>
                    </Flex>

                    <VStack spacing="6">
                      <Box width="full" position="relative">
                        <Input
                          size="lg"
                          placeholder="Enter amount to stake"
                          value={stakeAmount}
                          onChange={handleAmountChange}
                          type="number"
                          isInvalid={!isValidAmount}
                          pr="24"
                          bg="rgba(0,0,0,0.2)"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          _hover={{
                            borderColor: "whiteAlpha.400"
                          }}
                          _focus={{
                            borderColor: "brand.300",
                            boxShadow: "none"
                          }}
                          height="60px"
                          fontSize="md"
                        />
                        <Button
                          position="absolute"
                          right="4"
                          top="50%"
                          transform="translateY(-50%)"
                          size="sm"
                          variant="ghost"
                          onClick={() => setStakeAmount(tokenBalance)}
                          color="brand.300"
                          _hover={{
                            bg: "transparent",
                            color: "brand.400"
                          }}
                        >
                          MAX
                        </Button>
                        {!isValidAmount && (
                          <Text color="red.300" mt="2" fontSize="sm">
                            {validateAmount(stakeAmount)}
                          </Text>
                        )}
                      </Box>

                      <Box width="full" position="relative">
                        <Input
                          size="lg"
                          placeholder="Enter staking duration in days"
                          value={stakeDuration}
                          onChange={handleDurationChange}
                          type="number"
                          isInvalid={!isValidDuration}
                          pr="24"
                          bg="rgba(0,0,0,0.2)"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          _hover={{
                            borderColor: "whiteAlpha.400"
                          }}
                          _focus={{
                            borderColor: "brand.300",
                            boxShadow: "none"
                          }}
                          height="60px"
                          fontSize="md"
                          min="1"
                        />
                        <Text
                          position="absolute"
                          right="4"
                          top="50%"
                          transform="translateY(-50%)"
                          color="whiteAlpha.600"
                        >
                          Days
                        </Text>
                      </Box>

                      {!isValidDuration && (
                        <Text color="red.300" fontSize="sm" alignSelf="flex-start">
                          Duration must be greater than 0
                        </Text>
                      )}
                      
                      {stakeDuration && parseInt(stakeDuration) > 365 && (
                        <Text color="red.400" fontSize="sm" alignSelf="flex-start">
                          Caution: While you can stake for longer, DSI-Power rewards are calculated and valid only for the first 365 days.
                        </Text>
                      )}

                      <Box width="full" p="4" bg="whiteAlpha.200" borderRadius="xl">
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing="1">
                            <HStack spacing="2">
                              <Text fontWeight="bold">Estimated DSI Power</Text>
                              <Text 
                                fontSize="2xl" 
                                fontWeight="bold" 
                                color={stakeDuration && parseInt(stakeDuration) > 365 ? "red.400" : "brand.300"}
                              >
                                {parseFloat(estimatedDSIPower).toFixed(3)}
                              </Text>
                              <Text color="green.300" fontSize="md">
                                ({calculatePowerMultiplier().toFixed(1)}x more than holding)
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="whiteAlpha.600">
                              Normal holding power would be {calculateNormalDSIPower(parseFloat(stakeAmount), parseFloat(stakeDuration)).toFixed(3)}
                            </Text>
                          </VStack>
                          <Tooltip label="Learn more about DSI Power calculation">
                            <IconButton
                              icon={<QuestionIcon />}
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPowerInfo(!showPowerInfo)}
                            />
                          </Tooltip>
                        </Flex>
                        {showPowerInfo && (
                          <Alert status="info" mt="4" bg="whiteAlpha.300">
                            <AlertIcon />
                            <VStack align="start" spacing="2" width="full">
                              <Text fontSize="sm">
                                DSI Power determines your influence in the protocol. Higher power means greater voting weight and rewards.
                              </Text>
                              <Text fontSize="sm">
                                • Holding DSI: Power = Amount × Days
                                <br />
                                • Staking DSI: Power = Amount × Days × (1 + 0.2/30 × Days)
                              </Text>
                            </VStack>
                          </Alert>
                        )}
                      </Box>

                      <Alert status="info" bg="whiteAlpha.200" borderRadius="lg">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Your staked DSI will be locked for the entire staking period. Early withdrawals are not permitted.
                        </Text>
                      </Alert>

                      <Button
                        size="lg"
                        width="full"
                        onClick={handleStake}
                        isLoading={loading}
                        loadingText="Staking..."
                        isDisabled={!isValidAmount || !isValidDuration || loading}
                      >
                        Stake Tokens
                      </Button>
                    </VStack>

                    {/* Active Stakes Card */}
                    <Box 
                      mt="8"
                      p="6" 
                      bg="whiteAlpha.50" 
                      borderRadius="2xl" 
                      borderWidth="1px" 
                      borderColor="whiteAlpha.200"
                      backdropFilter="blur(12px)"
                      boxShadow="xl"
                      position="relative"
                      overflow="hidden"
                    >
                      <Flex justify="space-between" align="center" mb="6">
                        <Text color="whiteAlpha.800" fontSize="lg" fontWeight="semibold">Your Active Stakes</Text>
                        <HStack spacing="3">
                          <Text fontSize="sm" color="whiteAlpha.600">Total Staked:</Text>
                          <Text fontSize="md" fontWeight="bold" color="brand.300">
                            {userUnclaimedStaked} DSI
                          </Text>
                        </HStack>
                      </Flex>

                      <VStack spacing="4" align="stretch">
                        {userStakes.filter(stake => !stake.claimed).length > 0 ? (
                          userStakes
                            .filter(stake => !stake.claimed)
                            .map((stake, index) => (
                              <Box
                                key={`stake-${index}-${stake.startTime.toString()}`}
                                p="4"
                                bg="whiteAlpha.200"
                                borderRadius="xl"
                                width="full"
                                position="relative"
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                _before={{
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  borderRadius: 'xl',
                                  background: 'linear-gradient(45deg, var(--chakra-colors-brand-400), var(--chakra-colors-purple-400))',
                                  opacity: 0,
                                  transition: 'opacity 0.3s ease-in-out',
                                  zIndex: -1
                                }}
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  shadow: 'xl',
                                  _before: {
                                    opacity: 0.1
                                  }
                                }}
                              >
                                <Flex justify="space-between" align="center">
                                  <VStack align="start" spacing="1">
                                    <Text fontSize="lg" fontWeight="bold">
                                      {ethers.utils.formatEther(stake.amount)} DSI
                                    </Text>
                                    <Text color="brand.300">
                                      {parseFloat(ethers.utils.formatEther(stake.dsiPower)).toFixed(3)} Power
                                    </Text>
                                  </VStack>
                                  <VStack align="end" spacing="1">
                                    <Text>
                                      {formatTimeLeft(stake.endTime.toNumber())}
                                    </Text>
                                    <Progress
                                      value={100 - (Math.ceil((stake.endTime - Date.now()/1000)/60) / (24 * 60)) * 100}
                                      size="xs"
                                      width="100px"
                                      colorScheme="brand"
                                      borderRadius="full"
                                    />
                                    {isStakeClaimable(stake) ? (
                                      <Button
                                        onClick={() => handleClaim(index, stake)}
                                        isDisabled={claimingStakes[index]}
                                        colorScheme="green"
                                        size="sm"
                                        animation={`${pulseAnimation} 2s infinite`}
                                        _hover={{
                                          transform: 'scale(1.05)'
                                        }}
                                      >
                                        Claim
                                      </Button>
                                    ) : (
                                      <Text 
                                        fontSize="sm" 
                                        color="whiteAlpha.600"
                                        bgGradient="linear(to-r, brand.300, purple.400)"
                                        bgClip="text"
                                        fontWeight="medium"
                                      >
                                        {formatTimeLeft(stake.endTime.toNumber())}
                                      </Text>
                                    )}
                                  </VStack>
                                </Flex>
                              </Box>
                            ))
                        ) : (
                          <Alert status="info" bg="whiteAlpha.200">
                            <AlertIcon />
                            <Text>You don't have any active stakes yet</Text>
                          </Alert>
                        )}
                      </VStack>
                    </Box>
                  </TabPanel>

                  <TabPanel p="0">
                    <Flex justify="space-between" align="center" mb="4">
                      <Text color="whiteAlpha.700" fontSize="lg">Your Stakes</Text>
                      <Button
                        onClick={handleClaimAll}
                        isLoading={claimAllLoading}
                        loadingText="Claiming..."
                        colorScheme="green"
                        size="sm"
                        isDisabled={!userStakes.some(stake => isStakeClaimable(stake))}
                      >
                        Claim All Matured Stakes
                      </Button>
                    </Flex>
                    <VStack spacing="4" align="stretch">
                      {userStakes.length > 0 ? (
                        userStakes
                          .filter(stake => !stake.claimed)
                          .map((stake, index) => (
                            <Box
                              key={`unstake-${index}-${stake.startTime.toString()}`}
                              p="4"
                              bg="whiteAlpha.200"
                              borderRadius="xl"
                              transition="all 0.2s"
                              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                            >
                              <Flex justify="space-between" align="center">
                                <VStack align="start" spacing="1">
                                  <Text fontSize="lg" fontWeight="bold">
                                    {ethers.utils.formatEther(stake.amount)} DSI
                                  </Text>
                                  <Text color="brand.300">
                                    {parseFloat(ethers.utils.formatEther(stake.dsiPower)).toFixed(3)} Power
                                  </Text>
                                </VStack>
                                <VStack align="end" spacing="1">
                                  <Text>
                                    {formatTimeLeft(stake.endTime.toNumber())}
                                  </Text>
                                  <Progress
                                    value={100 - (Math.ceil((stake.endTime - Date.now()/1000)/60) / (24 * 60)) * 100}
                                    size="xs"
                                    width="100px"
                                    colorScheme="brand"
                                    borderRadius="full"
                                  />
                                  {isStakeClaimable(stake) ? (
                                    <Button
                                      onClick={() => handleClaim(index, stake)}
                                      isDisabled={claimingStakes[index]}
                                      colorScheme="green"
                                      size="sm"
                                      animation={`${pulseAnimation} 2s infinite`}
                                      _hover={{
                                        transform: 'scale(1.05)'
                                      }}
                                    >
                                      Claim
                                    </Button>
                                  ) : (
                                    <Text 
                                      fontSize="sm" 
                                      color="whiteAlpha.600"
                                      bgGradient="linear(to-r, brand.300, purple.400)"
                                      bgClip="text"
                                      fontWeight="medium"
                                    >
                                      {formatTimeLeft(stake.endTime.toNumber())}
                                    </Text>
                                  )}
                                </VStack>
                              </Flex>
                            </Box>
                          ))
                      ) : (
                        <Alert status="info" bg="whiteAlpha.200">
                          <AlertIcon />
                          <Text>You don't have any stakes to unstake</Text>
                        </Alert>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>

            {/* Right Panel */}
            <Box 
              w={{ base: "full", lg: "400px" }} 
              bg="whiteAlpha.50" 
              p="6" 
              borderRadius="2xl" 
              borderWidth="1px" 
              borderColor="whiteAlpha.200"
              backdropFilter="blur(10px)"
              boxShadow="xl"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-2px)' }}
            >
              <VStack spacing="6" align="stretch">
                <Box>
                  <HStack mb="4" justify="space-between">
                    <HStack>
                      <Text fontSize="lg">⚡ Your DSI Power</Text>
                      <Tooltip 
                        label="Your total earned DSI Power from all active stakes"
                        placement="top"
                        hasArrow
                        bg="gray.700"
                        color="white"
                        px="3"
                        py="2"
                        borderRadius="md"
                      >
                        <IconButton
                          icon={<InfoIcon />}
                          variant="ghost"
                          size="sm"
                        />
                      </Tooltip>
                    </HStack>
                    <Text fontSize="lg" color="brand.300" fontWeight="bold">
                      {parseFloat(totalEarnedPower).toFixed(3)}
                    </Text>
                  </HStack>
                  <Box p="4" bg="whiteAlpha.200" borderRadius="xl">
                    <VStack align="stretch" spacing="3">
                      <Flex justify="space-between" align="center">
                        <Text color="whiteAlpha.700">Power Share</Text>
                        <Text fontWeight="bold" color="brand.300">
                          {calculateDSIPowerPercentage().toFixed(3)}%
                        </Text>
                      </Flex>
                      <Progress 
                        value={calculateDSIPowerPercentage()} 
                        size="sm" 
                        colorScheme="brand" 
                        borderRadius="full"
                        bg="whiteAlpha.300"
                      />
                      <Text fontSize="sm" color="whiteAlpha.600">
                        of total {parseFloat(totalActiveDSIPower).toFixed(3)} DSI Power
                      </Text>
                    </VStack>
                  </Box>
                </Box>

                {/* Add Tier System Display */}
                <Box>
                  <HStack mb="4" justify="space-between">
                    <Text fontSize="lg">🏆 Power Tier</Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      bgGradient="linear(to-r, yellow.400, orange.400)" 
                      bgClip="text"
                    >
                      Tier {account ? calculateUserTier() : "-"}
                    </Text>
                  </HStack>
                  <Box p="4" bg="whiteAlpha.200" borderRadius="xl">
                    <VStack align="stretch" spacing="3">
                      {[
                        { tier: 5, requirement: "≥ 1%", color: "purple.400" },
                        { tier: 4, requirement: "≥ 0.1%", color: "blue.400" },
                        { tier: 3, requirement: "≥ 0.01%", color: "green.400" },
                        { tier: 2, requirement: "≥ 0.001%", color: "yellow.400" },
                        { tier: 1, requirement: "> 0% and < 0.001%", color: "gray.400" }
                      ].map((tier) => (
                        <Box
                          key={tier.tier}
                          p="4"
                          bg={account && calculateUserTier() === tier.tier ? 'whiteAlpha.200' : 'transparent'}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={account && calculateUserTier() === tier.tier ? tier.color : 'transparent'}
                          transition="all 0.3s ease-in-out"
                          position="relative"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: 'lg',
                            background: account && calculateUserTier() === tier.tier 
                              ? `linear-gradient(45deg, ${tier.color}, transparent)`
                              : 'transparent',
                            opacity: 0.1,
                            transition: 'opacity 0.3s ease-in-out'
                          }}
                          _hover={{
                            transform: 'translateX(4px)',
                            _before: {
                              opacity: 0.2
                            }
                          }}
                        >
                          <HStack>
                            <Text 
                              fontWeight={account && calculateUserTier() === tier.tier ? "bold" : "normal"}
                              color={account && calculateUserTier() === tier.tier ? tier.color : "whiteAlpha.800"}
                            >
                              Tier {tier.tier}
                            </Text>
                            {account && calculateUserTier() === tier.tier && (
                              <Text fontSize="sm" color={tier.color}>(Current)</Text>
                            )}
                          </HStack>
                          <Text color="whiteAlpha.600">{tier.requirement} Power Share</Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </Box>

                <Box>
                  <Text mb="4">DSI Power Formula</Text>
                  <Box p="4" bg="whiteAlpha.200" borderRadius="xl" position="relative">
                    <Text fontSize="lg" fontFamily="mono">
                      DSI-Power = x · y · (1 + 0.2/30 · y)
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.600" mt="2">
                      where x = stake amount, y = duration in days
                    </Text>
                  </Box>
                </Box>
              </VStack>
            </Box>
          </Flex>

          {/* Footer */}
          <Text 
            mt="12" 
            mb="6" 
            color="whiteAlpha.600" 
            fontSize="sm" 
            textAlign="center"
            maxW="2xl"
            mx="auto"
            lineHeight="tall"
          >
            Staking may involve risks; please read our{" "}
            <Text 
              as="span" 
              color="brand.300" 
              cursor="pointer" 
              _hover={{ 
                color: 'brand.400',
                textDecoration: 'underline' 
              }}
              transition="all 0.2s"
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text 
              as="span" 
              color="brand.300" 
              cursor="pointer" 
              _hover={{ 
                color: 'brand.400',
                textDecoration: 'underline' 
              }}
              transition="all 0.2s"
            >
              documentation
            </Text>{" "}
            before proceeding.
          </Text>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 