[[U20 Rebuild]]
- nms dedicated to switch (network configuration between this and NMS)
- nms dedicated portal and API
- ndp provisioning
- licf recording server
- voip monitor QOS (network configuration between this and NMS)

/24 carved out of /22 that is available

- BGP is announced out of alchemy and not out of our ASAs in our network
- Firepower ASAs able to do the announcements through Nexus switch stack and on through the alchemy network
	- 6 month timeline
		- VPN's off ASA (80?)
		- Bad things -> 20 year old hardware
	- Get rid of the Old Stack
		- Get rid of switches
			- Layer 2 -> Layer 3
		-  Get rid of ASAs
			- VPN
	- Migrations from Akron
	- Backup Migration
	- ProxMox Eval
	- Embrace Rework
		- Embrace recovery is 1-3
- Embrace Servers don't replicate on their own
- Nashville

- Customer Migrations from AKR ORC
	- Exchange
	- ECI
	- Citrix
	- Website
- Backups from AKR to NSH
- Old Cisco Stack Swap
- ProxMox Eval in ORC
- Embrace Rework in ORC and other

What are we saying when we say rehydrate vms?

Notes from call with Darrell about Network
- network taps
	- Vigilant (SOC)
	- Dynascale (Datacenter) -> Wants new agreement first (2 1GB copper -> 2 10GM handoffs)
	- matching optics
- New firewalls to aggregator is doable
- 2 blocks in use and advertised (157-158), one in use but not advertised (159), and 2 blocks are not in use and not advertised (156)

- Agreement with Dynascale: 1-2 weeks (29th)
	- Will negotiating
	- If Dynascale has to run fiber then BGP will be another week or two
	- reach out netsapiens about rehydrating embrace (2 week lead time to project)
- Cut Nexus Firewall to new connections: 1 week 5th
	- Setup BGP (maintenance windows)
	- /30 blocks
	- Testing and validation: 1 week 12th
- Action Items
	- Dynascale Quote
	- Dub needs specs from David
		- module to host breakdown and specs per module